use super::prelude::*;

pub use bson::oid::ObjectId;

#[derive(
    Debug,
    Display,
    Clone,
    Hash,
    PartialEq,
    Eq,
    EnumString,
    Serialize,
    Deserialize,
)]
pub enum ObjectType {
    User,
    Membership,
    MemberRole,
}

#[derive(Debug, Clone)]
pub struct GlobalId {
    object_id: ObjectId,
    object_type: ObjectType,
}

impl GlobalId {
    pub fn new(object_id: ObjectId, object_type: ObjectType) -> Self {
        Self {
            object_id,
            object_type,
        }
    }

    pub fn of<T: Object>(object: &T) -> Self {
        let object_id = object.object_id();
        let object_type = T::OBJECT_TYPE;
        Self::new(object_id, object_type)
    }

    pub fn get<T: Object>(self) -> Option<ObjectId> {
        let Self {
            object_id,
            object_type,
        } = self;
        if object_type == T::OBJECT_TYPE {
            Some(object_id)
        } else {
            None
        }
    }

    // pub fn object_id<T: Object>(&self) -> Result<&ObjectId> {
    //     &self.object_id
    // }

    // pub fn object_id_unchecked(&self) -> &ObjectId {
    //     &self.object_id
    // }
}

impl Display for GlobalId {
    fn fmt(&self, f: &mut Formatter<'_>) -> FmtResult {
        write!(f, "{}:{}", &self.object_type, &self.object_id)
    }
}

impl FromStr for GlobalId {
    type Err = Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let [object_type, object_id] = {
            let parts: Vec<_> = s.split(':').take(2).collect();
            match parts[..] {
                [object_type, object_id] => [object_type, object_id],
                _ => bail!("invalid structure"),
            }
        };

        let object_type: ObjectType =
            object_type.parse().context("failed to parse object type")?;
        let object_id: ObjectId =
            object_id.parse().context("failed to parse object ID")?;

        let id = Self::new(object_id, object_type);
        Ok(id)
    }
}

impl Serialize for GlobalId {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let s = self.to_string();
        serializer.serialize_str(&s)
    }
}

impl<'de> Deserialize<'de> for GlobalId {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        s.parse().map_err(DeserializeError::custom)
    }
}
