use super::prelude::*;
#[derive(Debug, Clone)]
pub struct Query;

#[Object]
impl Query {
    async fn build_info<'a>(&self, ctx: &'a Context<'_>) -> BuildInfoObject {
        let info = ctx.data_unchecked::<BuildInfo>().clone();
        info.into()
    }
}
