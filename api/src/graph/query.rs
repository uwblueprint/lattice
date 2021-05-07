use super::prelude::*;

#[derive(Debug, Clone, MergedObject)]
pub struct Query(BuildQuery, UserQuery);

impl Query {
    pub fn new() -> Self {
        Self(BuildQuery, UserQuery)
    }
}
