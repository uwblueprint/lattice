use super::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Builder)]
#[builder(field_defaults(setter(into)))]
pub struct User {
    #[builder(default, setter(skip))]
    pub id: ObjectId,

    #[builder(default = Utc::now(), setter(skip))]
    pub created_at: DateTime,

    #[builder(default = Utc::now(), setter(skip))]
    pub updated_at: DateTime,

    pub first_name: String,
    pub last_name: String,
    pub email: String,

    #[builder(default)]
    pub phone: Option<String>,

    #[builder(default)]
    pub photo_url: Option<String>,

    #[builder(default)]
    pub website_url: Option<String>,

    #[builder(default)]
    pub twitter_handle: Option<String>,

    #[builder(default)]
    pub instagram_handle: Option<String>,

    #[builder(default)]
    pub bio: Option<String>,
}

impl Object for User {
    const OBJECT_TYPE: ObjectType = ObjectType::User;

    fn object_id(&self) -> ObjectId {
        self.id.clone()
    }
}

impl Entity for User {
    const COLLECTION_NAME: &'static str = "users";
}

impl User {
    pub fn find_by_email(email: impl Into<String>) -> FindOneQuery<Self> {
        let email: String = email.into();
        Self::find_by(doc! { "email": email })
    }

    pub fn memberships(&self) -> FindQuery<Membership> {
        let user_ref = self.object_ref();
        let conditions = MembershipConditions::builder().user(user_ref).build();
        Membership::filter(conditions)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Builder)]
#[builder(field_defaults(default, setter(into)))]
pub struct UserConditions {
    pub query: Option<String>,
}

impl From<UserConditions> for Document{
    fn from(conditions: UserConditions) -> Document {
        let UserConditions{ query } = conditions;

        let mut doc = Document::new();
        if let Some(query) = query {
            doc.insert("$text", doc! { "$search": query });
        }

        doc
    }
}
