use super::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Builder)]
#[builder(field_defaults(setter(into)))]
pub struct Membership {
    #[builder(default, setter(skip))]
    pub id: ObjectId,

    #[builder(default = Utc::now(), setter(skip))]
    pub created_at: DateTime,

    #[builder(default = Utc::now(), setter(skip))]
    pub updated_at: DateTime,

    pub start: DateTime,
    pub end: DateTime,
}

impl Object for Membership {
    const OBJECT_TYPE: ObjectType = ObjectType::Membership;

    fn object_id(&self) -> ObjectId {
        self.id.clone()
    }
}

impl Entity for Membership {
    const COLLECTION_NAME: &'static str = "memberships";
}

#[derive(Debug, Clone, Serialize, Deserialize, Builder)]
#[builder(field_defaults(setter(into)))]
pub struct MemberRole {
    #[builder(default, setter(skip))]
    pub id: ObjectId,

    #[builder(default = Utc::now(), setter(skip))]
    pub created_at: DateTime,

    #[builder(default = Utc::now(), setter(skip))]
    pub updated_at: DateTime,

    pub name: String,
    pub description: String,
}

// TODO: Don't allow deleting a member role that users are bound to.
impl Object for MemberRole {
    const OBJECT_TYPE: ObjectType = ObjectType::MemberRole;

    fn object_id(&self) -> ObjectId {
        self.id.clone()
    }
}

impl Entity for MemberRole {
    const COLLECTION_NAME: &'static str = "member_roles";
}
