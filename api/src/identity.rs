use super::prelude::*;

use jwt::decode as decode_token;
use jwt::Algorithm as JwtAlgorithm;
use jwt::Validation as TokenValidation;
use jwt::{decode_header, DecodingKey, Header, TokenData};

use cache_control::CacheControl;
use http::header::CACHE_CONTROL;
use request::Client;
use tokio::sync::Mutex;

lazy_static! {
    static ref EXPIRY_LEEWAY: Duration = Duration::seconds(30);
}

#[derive(Debug, Clone, Hash, Serialize, Deserialize)]
pub struct Claims {
    pub exp: u64,
    pub iat: u64,
    pub aud: String,
    pub iss: String,
    pub sub: String,
    pub user_id: String,
    pub email: String,
    pub email_verified: bool,
}

#[derive(Debug)]
pub struct Identity(TokenData<Claims>);

impl Identity {
    pub fn new(data: TokenData<Claims>) -> Self {
        Self(data)
    }

    #[allow(dead_code)]
    pub fn header(&self) -> &Header {
        &self.0.header
    }

    pub fn claims(&self) -> &Claims {
        &self.0.claims
    }
}

impl From<TokenData<Claims>> for Identity {
    fn from(data: TokenData<Claims>) -> Self {
        Self::new(data)
    }
}

#[async_trait]
pub trait Identifier: Sync + Send {
    async fn identify(&self, token: &str) -> Result<Identity>;
}

const FIREBASE_KEY_URL: &str = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";
const FIREBASE_ISS_URL: &str = "https://securetoken.google.com";

#[derive(Debug)]
pub struct FirebaseIdentifier {
    project_id: String,
    client: Mutex<FirebaseClient>,
}

impl FirebaseIdentifier {
    pub fn new(project_id: impl Into<String>) -> Self {
        let project_id = project_id.into();
        let client = FirebaseClient::new(project_id.clone());
        Self {
            project_id,
            client: Mutex::new(client),
        }
    }
}

impl FirebaseIdentifier {
    fn expected_iss(&self) -> String {
        format!("{}/{}", FIREBASE_ISS_URL, &self.project_id)
    }

    fn expected_aud(&self) -> String {
        self.project_id.to_owned()
    }
}

#[async_trait]
#[inherent(pub)]
impl Identifier for FirebaseIdentifier {
    async fn identify(&self, token: &str) -> Result<Identity> {
        let mut validation = TokenValidation::new(JwtAlgorithm::RS256);
        validation.leeway = EXPIRY_LEEWAY.num_seconds().try_into().unwrap();
        validation.iss = Some(self.expected_iss());
        validation.set_audience(&[self.expected_aud()]);

        let header = decode_header(token).context("failed to decode header")?;
        let kid = header.kid.context("missing key ID")?;

        let keys = {
            let mut client = self.client.lock().await;
            client
                .keys()
                .await
                .context("failed to load decoding keys")?
        };
        let key = keys.get(&kid).context("no matching decoding keys")?;
        let data = decode_token::<Claims>(token, key, &validation)?;

        let expires_at = Utc::now() + *EXPIRY_LEEWAY;
        let issued_at = Utc.timestamp(
            data.claims
                .iat
                .try_into()
                .context("failed to convert issued-at time to u64")?,
            0,
        );
        if issued_at > expires_at {
            bail!("invalid issued-at time");
        }

        Ok(data.into())
    }
}

#[derive(Debug, Clone)]
struct FirebaseClient {
    client: Client,
    project_id: String,
    refresh_at: DateTime,
    keys: Map<String, DecodingKey<'static>>,
}

impl FirebaseClient {
    pub fn new(project_id: String) -> Self {
        Self {
            client: Client::new(),
            project_id,
            refresh_at: Utc::now(),
            keys: Default::default(),
        }
    }

    pub async fn keys(&mut self) -> Result<Map<String, DecodingKey<'static>>> {
        self.sync().await?;
        Ok(self.keys.clone())
    }
}

impl FirebaseClient {
    async fn sync(&mut self) -> Result<()> {
        let refresh_at = self.refresh_at - Duration::seconds(1);
        if Utc::now() <= refresh_at {
            return Ok(());
        }
        let response = self.client.get(FIREBASE_KEY_URL).send().await?;

        let cache_control = response
            .headers()
            .get(CACHE_CONTROL)
            .context("missing cache-control header")?;
        let cache_control = cache_control
            .to_str()
            .context("failed to parse cache-control header")?;
        let cache_control = CacheControl::from_value(cache_control)
            .context("missing cache-control directives")?;

        let max_age = cache_control.max_age.context("missing max-age")?;
        self.refresh_at = Utc::now() + max_age;

        let data = response
            .json::<JwkData>()
            .await
            .context("failed to parse response")?;
        let mut keys = Map::<String, DecodingKey<'static>>::new();
        for jwk in data.keys {
            let JwkInfo { kid, n, e } = jwk;
            let key = DecodingKey::from_rsa_components(&n, &e).into_static();
            keys.insert(kid, key);
        }
        self.keys = keys;
        Ok(())
    }
}

#[derive(Debug, Clone, Hash, Serialize, Deserialize)]
struct JwkData {
    keys: Vec<JwkInfo>,
}

#[derive(Debug, Clone, Hash, Serialize, Deserialize)]
struct JwkInfo {
    kid: String,
    n: String,
    e: String,
}
