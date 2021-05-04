use super::prelude::*;

#[derive(Debug, Clone, From, Deref)]
pub struct BuildInfoObject(BuildInfo);

#[Object(name = "BuildInfo")]
impl BuildInfoObject {
    async fn timestamp(&self) -> &DateTime<FixedOffset> {
        &self.timestamp
    }

    async fn version(&self) -> Option<&String> {
        self.version.as_ref()
    }
}
