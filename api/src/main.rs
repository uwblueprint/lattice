use chrono::{DateTime, FixedOffset};
use http::StatusCode;
use tokio;
use tracing_subscriber::fmt::init as init_tracer;

use std::borrow::Cow;
use std::convert::Infallible;
use std::net::SocketAddr;

use anyhow::Context as AnyhowContext;
use anyhow::Result;

use warp::get;
use warp::http::Response as HttpResponse;
use warp::path;
use warp::reply::json as reply_json;
use warp::reply::with_status as reply_with_status;
use warp::serve;
use warp::{Filter, Rejection};

use graphql::http::playground_source as graphql_playground_source;
use graphql::http::GraphQLPlaygroundConfig;
use graphql::Request as GraphQLRequest;
use graphql::{EmptyMutation, EmptySubscription, Schema};

use graphql_warp::graphql as warp_graphql;
use graphql_warp::graphql_subscription as warp_graphql_subscription;
use graphql_warp::BadRequest as BadGraphQLRequest;
use graphql_warp::Response as GraphQLResponse;

mod entities;
mod env;
mod graph;
mod prelude;

use entities::BuildInfo;
use env::load as load_env;
use env::var_or as env_var_or;
use graph::Query;
use prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    // Load environment variables and initialize tracer.
    load_env().context("failed to load environment variables")?;
    init_tracer();

    // Read build info.
    let timestamp =
        DateTime::<FixedOffset>::parse_from_rfc3339(env!("BUILD_TIMESTAMP"))
            .context("failed to parse build timestamp")?;
    let version = match env!("BUILD_VERSION") {
        "" => None,
        version => Some(version.to_owned()),
    };
    let build_info = BuildInfo { timestamp, version };

    // Build GraphQL schema.
    let schema = Schema::build(Query, EmptyMutation, EmptySubscription)
        .data(build_info)
        .finish();

    // Build GraphQL filters
    let graphql = warp_graphql(schema.clone()).and_then(
        |(schema, request): (Schema<_, _, _>, GraphQLRequest)| async move {
            Ok::<_, Infallible>(GraphQLResponse::from(
                schema.execute(request).await,
            ))
        },
    );
    let graphql_subscription = warp_graphql_subscription(schema);
    let graphql_playground = get().map(|| {
        let config = GraphQLPlaygroundConfig::new("/api/graphql")
            .subscription_endpoint("/api/graphql");
        let source = graphql_playground_source(config);
        HttpResponse::builder()
            .header("content-type", "text/html")
            .body(source)
    });

    // Build root filter.
    let root = graphql_playground
        .or(path("graphql").and(graphql_subscription.or(graphql)))
        .recover(|err: Rejection| async move {
            let (error, status_code) = if err.is_not_found() {
                let error = ServerError::new("not found");
                (error, StatusCode::NOT_FOUND)
            } else if let Some(BadGraphQLRequest(err)) = err.find() {
                let error = ServerError::new(err.to_string());
                (error, StatusCode::BAD_REQUEST)
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

#[derive(Debug, Serialize)]
struct ServerRejectionReply {
    errors: Vec<ServerError>,
    status_code: u16,
}

#[derive(Debug, Serialize)]
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
