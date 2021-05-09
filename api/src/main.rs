use http::StatusCode;
use mongodb::Client;
use tracing_subscriber::fmt::init as init_tracer;

use std::borrow::Cow;
use std::convert::Infallible;
use std::net::SocketAddr;
use std::ops::Deref;

use anyhow::Context as AnyhowContext;
use anyhow::Result;

use warp::header::optional as header;
use warp::http::Response as HttpResponse;
use warp::path::end as path_end;
use warp::reject::custom as custom_rejection;
use warp::reject::Reject;
use warp::reply::json as reply_json;
use warp::reply::with_status as reply_with_status;
use warp::{any, get, path, serve};
use warp::{Filter, Rejection};

use graphql::http::playground_source as graphql_playground_source;
use graphql::http::GraphQLPlaygroundConfig;
use graphql::Request as GraphQLRequest;
use graphql::{EmptySubscription, Schema};

use graphql_warp::graphql as warp_graphql;
use graphql_warp::graphql_subscription as warp_graphql_subscription;
use graphql_warp::BadRequest as BadGraphQLRequest;
use graphql_warp::Response as GraphQLResponse;

use lattice::entities::{BuildInfo, Context};
use lattice::env::load as load_env;
use lattice::env::var as env_var;
use lattice::env::var_or as env_var_or;

mod graph;
mod identity;
mod prelude;

use graph::{Mutation, Query};
use identity::{FirebaseIdentifier, Identifier, Identity};
use prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    // Load environment variables and initialize tracer.
    load_env().context("failed to load environment variables")?;
    init_tracer();

    // Read build info.
    let timestamp: DateTime<FixedOffset> =
        DateTime::parse_from_rfc3339(env!("BUILD_TIMESTAMP"))
            .context("failed to parse build timestamp")?;
    let version = match env!("BUILD_VERSION") {
        "" => None,
        version => Some(version.to_owned()),
    };
    let build_info = BuildInfo { timestamp, version };

    // Build entity context.
    let context = {
        let uri = env_var_or("FIREBASE_MONGO_URI", "mongodb://localhost:27017")
            .context("failed to get MongoDB URI")?;
        let client = Client::with_uri_str(&uri)
            .await
            .context("failed to build MongoDB client")?;
        let database_name = env_var_or("FIREBASE_MONGO_DATABASE", "lattice")
            .context("failed to get MongoDB database name")?;
        let database = client.database(&database_name);
        Context::new(database)
    };

    // Build identitifier.
    let identifier = {
        let project_id =
            env_var("FIREBASE_ID").context("failed to parse firebase ID")?;
        FirebaseIdentifier::new(project_id)
    };

    // Build GraphQL schema.
    let schema = {
        let query = Query::new();
        let mutation = Mutation::new();
        let subscription = EmptySubscription;
        Schema::build(query, mutation, subscription)
            .data(build_info)
            .data(context)
            .finish()
    };

    // Build GraphQL filters
    let graphql = {
        let identifier = Arc::new(identifier);
        warp_graphql(schema.clone())
            .untuple_one()
            .and(identify(identifier))
            .and_then(
                |schema: Schema<_, _, _>,
                 request: GraphQLRequest,
                 identity: Option<Identity>| async move {
                    let request = match identity {
                        Some(identity) => request.data(identity),
                        None => request,
                    };
                    let response = schema.execute(request).await;
                    let response = GraphQLResponse::from(response);
                    Ok::<_, Infallible>(response)
                },
            )
    };

    let graphql_subscription = warp_graphql_subscription(schema);
    let graphql_playground = get().map(|| {
        let config = GraphQLPlaygroundConfig::new("/api/graphql")
            .subscription_endpoint("/api/graphql");
        let source = graphql_playground_source(config);
        HttpResponse::builder()
            .header("content-type", "text/html")
            .body(source)
    });

    // Build API routes.
    let api = path("api").and(
        path_end()
            .and(graphql_playground)
            .or(path("graphql").and(graphql_subscription.or(graphql))),
    );

    // Build root filter.
    let root = api.recover(|rejection: Rejection| async move {
        let (error, status_code) = if rejection.is_not_found() {
            let error = ServerError::new("not found");
            (error, StatusCode::NOT_FOUND)
        } else if let Some(BadGraphQLRequest(err)) = rejection.find() {
            let error = ServerError::new(err.to_string());
            (error, StatusCode::BAD_REQUEST)
        } else if let Some(error) = rejection.find::<Error>() {
            let error = ServerError::new(format!("{:#}", error));
            (error, StatusCode::INTERNAL_SERVER_ERROR)
        } else {
            let error = ServerError::new("internal server error");
            (error, StatusCode::INTERNAL_SERVER_ERROR)
        };

        let reply = ServerRejectionReply {
            errors: vec![error],
            status_code: status_code.as_u16(),
        };
        let reply = reply_json(&reply);
        let reply = reply_with_status(reply, status_code);
        Ok::<_, Infallible>(reply)
    });

    let host =
        env_var_or("HOST", "0.0.0.0").context("failed to get server host")?;
    let port =
        env_var_or("PORT", "3000").context("failed to get server port")?;
    let addr: SocketAddr = format!("{}:{}", host, port)
        .parse()
        .context("failed to parse server address")?;

    info!(target: "server", "listening on http://{}", &addr);
    serve(root).run(addr).await;
    Ok(())
}

fn identify(
    identifier: Arc<impl Identifier>,
) -> impl Filter<Extract = (Option<Identity>,), Error = Rejection> + Clone {
    any()
        .map(move || identifier.clone())
        .and(header("authorization"))
        .and_then(|identifier, authorization: Option<String>| async move {
            let authorization = match authorization {
                Some(authorization) => authorization,
                None => return Ok(None),
            };
            let token = authorization
                .strip_prefix("Bearer ")
                .context("bad authorization header format")
                .map_err(|error| {
                    custom_rejection(AuthorizationError {
                        error,
                        status_code: StatusCode::BAD_REQUEST,
                    })
                })?;
            let identifier = Deref::deref(&identifier);
            let identity = Identifier::identify(identifier, token)
                .await
                .context("failed to decode authentication token")
                .map_err(|error| {
                    custom_rejection(AuthorizationError {
                        error,
                        status_code: StatusCode::INTERNAL_SERVER_ERROR,
                    })
                })?;
            Result::<_, Rejection>::Ok(Some(identity))
        })
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ServerRejectionReply {
    errors: Vec<ServerError>,
    status_code: u16,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ServerError {
    message: Cow<'static, str>,
}

impl ServerError {
    fn new(message: impl Into<Cow<'static, str>>) -> Self {
        Self {
            message: message.into(),
        }
    }
}

#[derive(Debug)]
struct AuthorizationError {
    error: Error,
    status_code: StatusCode,
}

impl Reject for AuthorizationError {}
