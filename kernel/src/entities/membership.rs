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

    pub user: ObjectRef,
    pub role: ObjectRef,

    pub start: Date,
    pub end: Date,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct MembershipDocument {
    #[serde(rename = "_id")]
    pub id: ObjectId,
    pub created_at: BsonDateTime,
    pub updated_at: BsonDateTime,
    pub user: ObjectRef,
    pub role: ObjectRef,
    pub start: BsonDateTime,
    pub end: BsonDateTime,
}

impl From<MembershipDocument> for Membership {
    fn from(doc: MembershipDocument) -> Self {
        let MembershipDocument {
            id,
            created_at,
            updated_at,
            user,
            role,
            start,
            end,
        } = doc;

        Membership {
            id,
            created_at: created_at.into(),
            updated_at: updated_at.into(),
            user,
            role,
            start: date::from_date_time(start.into()),
            end: date::from_date_time(end.into()),
        }
    }
}

impl From<Membership> for MembershipDocument {
    fn from(membership: Membership) -> Self {
        let Membership {
            id,
            created_at,
            updated_at,
            user,
            role,
            start,
            end,
        } = membership;

        MembershipDocument {
            id,
            created_at: created_at.into(),
            updated_at: updated_at.into(),
            user,
            role,
            start: date::to_date_time(start).into(),
            end: date::to_date_time(end).into(),
        }
    }
}

impl Object for Membership {
    const OBJECT_TYPE: ObjectType = ObjectType::Membership;

    fn object_id(&self) -> ObjectId {
        self.id.clone()
    }

    fn to_document(&self) -> Result<Document> {
        let doc = MembershipDocument::from(self.clone());
        let doc = to_document(&doc)?;
        Ok(doc)
    }

    fn from_document(doc: Document) -> Result<Self> {
        let doc: MembershipDocument = from_document(doc)?;
        Ok(doc.into())
    }
}

impl Entity for Membership {
    const COLLECTION_NAME: &'static str = "memberships";
}

impl Membership {
    pub fn user(&self) -> FindOneQuery<User> {
        User::find(&self.user.id)
    }

    pub fn role(&self) -> FindOneQuery<MemberRole> {
        MemberRole::find(&self.role.id)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Builder)]
#[builder(field_defaults(default, setter(into)))]
pub struct MembershipConditions {
    pub user: Option<ObjectRef>,
    pub role: Option<ObjectRef>,
}

impl From<MembershipConditions> for Document {
    fn from(conditions: MembershipConditions) -> Document {
        let mut doc = Document::new();

        let MembershipConditions { user, role } = conditions;
        if let Some(user_ref) = user {
            doc.insert("user.id", user_ref.id);
        }
        if let Some(role_ref) = role {
            doc.insert("role.id", role_ref.id);
        }

        doc
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MembershipSorting {
    Start(SortingOrder),
    End(SortingOrder),
}

impl From<MembershipSorting> for Document {
    fn from(sorting: MembershipSorting) -> Document {
        use MembershipSorting::*;
        match sorting {
            Start(order) => doc! { "start": order },
            End(order) => doc! { "end": order },
        }
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
        let role_ref = self.object_ref();
        let conditions = MembershipConditions::builder().role(role_ref).build();
        let count = Membership::filter(conditions).count(ctx).await?;
        if count.is_positive() {
            bail!("member role currently in use")
        }
        Ok(())
    }
}
