use super::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: ObjectId,
    pub created_at: DateTime,
    pub updated_at: DateTime,

    pub firebase_id: String,
    pub email: String,
}

#[async_trait]
#[inherent(pub)]
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
