use crate::entities::*;

use graphql::Context;
use graphql::Object;

#[derive(Debug, Clone)]
pub struct Query;

#[Object]
impl Query {
    async fn build_info<'a>(&self, ctx: &'a Context<'_>) -> &'a BuildInfo {
        ctx.data_unchecked::<BuildInfo>()
    }
}
