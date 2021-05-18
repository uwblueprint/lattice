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

    pub user_id: ObjectId,
    pub role_id: ObjectId,

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

impl Membership {
    pub fn user(&self) -> FindOneQuery<User> {
        User::find(&self.user_id)
    }

    pub fn role(&self) -> FindOneQuery<MemberRole> {
        MemberRole::find(&self.role_id)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Builder)]
#[builder(field_defaults(default, setter(into)))]
pub struct MembershipConditions {
    pub user_id: Option<ObjectId>,
    pub role_id: Option<ObjectId>,
}

impl Into<Document> for MembershipConditions {
    fn into(self) -> Document {
        to_document(&self).unwrap()
    }
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

#[async_trait]
impl Entity for MemberRole {
    const COLLECTION_NAME: &'static str = "member_roles";

    async fn before_delete(&mut self, ctx: &Context) -> Result<()> {
        // Check that no existing membership uses this role.
        let role_id = self.id.clone();
        let conditions =
            MembershipConditions::builder().role_id(role_id).build();
        let count = Membership::filter(conditions).count(ctx).await?;
        if count > 0 {
            bail!("member role currently in use")
        }
        Ok(())
    }
}
