use super::prelude::*;

#[derive(Debug, Clone, MergedObject)]
pub struct Query(BuildQueries, UserQueries, MembershipQueries);

impl Query {
    pub fn new() -> Self {
        Self(BuildQueries, UserQueries, MembershipQueries)
    }
}
