use super::prelude::*;

pub fn with_identity<'a>(
    ctx: &'a Context<'_>,
) -> FieldResult<&'a IdentityClaims> {
    let identity: &Identity = ctx.data_opt().context("not authorized")?;
    let claims = identity.claims();
    Ok(claims)
}

pub async fn with_viewer<'a>(ctx: &'a Context<'_>) -> FieldResult<User> {
    let IdentityClaims { email, .. } = with_identity(ctx)?;
    let user = User::find_by_email(email)
        .load(ctx.entity())
        .await
        .context("failed to load user")
        .into_field_result()?;
    match user {
        Some(user) => Ok(user),
        None => {
            let error = format_err!("user not registered");
            Err(error.into())
        }
    }
}

pub trait ContextExt {
    fn entity(&self) -> &EntityContext;
}

impl<'a> ContextExt for Context<'a> {
    fn entity(&self) -> &EntityContext {
        self.data_unchecked()
    }
}

pub trait ResultExt<T> {
    fn into_field_result(self) -> FieldResult<T>;
}

impl<T> ResultExt<T> for Result<T> {
    fn into_field_result(self) -> FieldResult<T> {
        let result = Result::from(self);
        result.map_err(|error| {
            let message = format!("{:#}", error);
            FieldError::new(message)
        })
    }
}
