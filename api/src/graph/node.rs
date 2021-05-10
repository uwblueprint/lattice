use super::prelude::*;

use base64::decode as decode_base64;
use base64::encode as encode_base64;

#[derive(Debug, Clone, Into, From, Deref)]
pub struct NodeId(GlobalId);

impl NodeId {
    pub fn get<T: Object>(self) -> Option<ObjectId> {
        self.0.get::<T>()
    }
}

impl Serialize for NodeId {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let raw = self.to_string();
        let encoded = encode_base64(raw);
        serializer.serialize_str(&encoded)
    }
}

impl<'de> Deserialize<'de> for NodeId {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let encoded = String::deserialize(deserializer)?;
        let raw = decode_base64(encoded)
            .context("failed to decode base64")
            .map_err(DeserializeError::custom)?;
        let raw = String::from_utf8(raw)
            .context("invalid UTF-8")
            .map_err(DeserializeError::custom)?;

        let id: GlobalId = raw.parse().map_err(DeserializeError::custom)?;
        let id: NodeId = id.into();
        Ok(id)
    }
}

scalar!(NodeId, "ID");
