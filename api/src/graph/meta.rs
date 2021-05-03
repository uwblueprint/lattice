use super::prelude::*;

#[derive(Debug, Clone, From)]
pub struct BuildInfoObject(BuildInfo);

#[Object(name = "BuildInfo")]
impl BuildInfoObject {
    async fn timestamp(&self) -> &DateTime<FixedOffset> {
        &self.0.timestamp
    }

    async fn version(&self) -> Option<&String> {
        self.0.version.as_ref()
    }
}
