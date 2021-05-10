use super::prelude::*;

#[derive(Debug, Clone, MergedObject)]
pub struct Mutation(UserMutations, MembershipMutations);

impl Mutation {
    pub fn new() -> Self {
        Self(UserMutations, MembershipMutations)
    }
}
