use super::prelude::*;

#[derive(Debug, Clone, MergedObject)]
pub struct Mutation(UserMutation);

impl Mutation {
    pub fn new() -> Self {
        Self(UserMutation)
    }
}
