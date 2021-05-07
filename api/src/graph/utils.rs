use super::prelude::*;

pub fn with_identity<'a>(
    ctx: &'a Context<'_>,
) -> FieldResult<&'a IdentityClaims> {
    let identity: &Identity = ctx.data_opt().context("not authorized")?;
    let claims = identity.claims();
    Ok(claims)
}

pub trait ContextExt {
    fn entity(&self) -> &EntityContext;
}

impl<'a> ContextExt for Context<'a> {
    fn entity(&self) -> &EntityContext {
        self.data_unchecked()
    }
}
