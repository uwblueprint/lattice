use super::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Builder)]
pub struct User {
    #[builder(default, setter(skip))]
    pub id: ObjectId,

    #[builder(default = Utc::now(), setter(skip))]
    pub created_at: DateTime,

    #[builder(default = Utc::now(), setter(skip))]
    pub updated_at: DateTime,

    #[builder(setter(into))]
    pub firebase_id: String,

    #[builder(setter(into))]
    pub email: String,

    #[builder(setter(into))]
    pub first_name: String,

    #[builder(setter(into))]
    pub last_name: String,
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

    pub fn find_by_firebase_id(
        firebase_id: impl Into<String>,
    ) -> FindOneQuery<Self> {
        let id: String = firebase_id.into();
        Self::find_by(doc! { "firebase_id": id })
    }
}
