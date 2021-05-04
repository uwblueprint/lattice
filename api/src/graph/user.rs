use super::prelude::*;

#[derive(Debug, Clone, From, Deref)]
pub struct UserObject(User);

// TODO: Use macros to generate simple getters.
#[Object(name = "User")]
impl UserObject {
    async fn id(&self) -> NodeId {
        self.global_id().into()
    }

    async fn email(&self) -> &String {
        &self.email
    }

    async fn first_name(&self) -> &String {
        &self.first_name
    }

    async fn last_name(&self) -> &String {
        &self.last_name
    }
}
