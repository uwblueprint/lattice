use super::prelude::*;

pub fn with_identity<'a>(
    ctx: &'a Context<'_>,
) -> FieldResult<&'a IdentityClaims> {
    let identity: &Identity = ctx.data_opt().ensure("not authorized")?;
    let claims = identity.claims();
    Ok(claims)
}

pub async fn with_viewer<'a>(ctx: &'a Context<'_>) -> FieldResult<User> {
    let IdentityClaims { email, .. } = with_identity(ctx)?;
    let user = User::find_by_email(email)
        .load(ctx.entity())
        .await
        .extend("failed to load user")?;
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
    fn extend<C>(self, context: C) -> FieldResult<T>
    where
        C: Display + Send + Sync + 'static;

    fn extend_with<C, F>(self, f: F) -> FieldResult<T>
    where
        C: Display + Send + Sync + 'static,
        F: FnOnce() -> C;
}

impl<T, E> ResultExt<T> for Result<T, E>
where
    Result<T, E>: AnyhowContext<T, E>,
{
    fn extend<C>(self, context: C) -> FieldResult<T>
    where
        C: Display + Send + Sync + 'static,
    {
        let result = self.context(context);
        let result = Result::from(result);
        into_field_result(result)
    }

    fn extend_with<C, F>(self, f: F) -> FieldResult<T>
    where
        C: Display + Send + Sync + 'static,
        F: FnOnce() -> C,
    {
        let result = self.with_context(f);
        let result = Result::from(result);
        into_field_result(result)
    }
}

pub trait OptionExt<T> {
    fn ensure<C>(self, context: C) -> FieldResult<T>
    where
        C: Display + Send + Sync + 'static;

    fn ensure_with<C, F>(self, f: F) -> FieldResult<T>
    where
        C: Display + Send + Sync + 'static,
        F: FnOnce() -> C;
}

impl<T> OptionExt<T> for Option<T> {
    fn ensure<C>(self, context: C) -> FieldResult<T>
    where
        C: Display + Send + Sync + 'static,
    {
        let result = self.context(context);
        let result = Result::from(result);
        into_field_result(result)
    }

    fn ensure_with<C, F>(self, f: F) -> FieldResult<T>
    where
        C: Display + Send + Sync + 'static,
        F: FnOnce() -> C,
    {
        let result = self.with_context(f);
        let result = Result::from(result);
        into_field_result(result)
    }
}

fn into_field_result<T>(result: Result<T>) -> FieldResult<T> {
    result.map_err(|error| {
        let message = format!("{:#}", error);
        FieldError::new(message)
    })
}
