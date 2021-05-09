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

#[derive(Debug, Clone)]
pub struct UserQuery;

#[Object]
impl UserQuery {
    async fn viewer(
        &self,
        ctx: &Context<'_>,
    ) -> FieldResult<Option<UserObject>> {
        let firebase_id = match ctx.data_opt::<Identity>() {
            Some(identity) => {
                let IdentityClaims { user_id, .. } = identity.claims();
                user_id.as_str()
            }
            None => return Ok(None),
        };
        let user = User::find_by_firebase_id(firebase_id)
            .load(ctx.entity())
            .await
            .context("failed to load user")?;
        let user = user.map(UserObject::from);
        Ok(user)
    }
}

#[derive(Debug, Clone)]
pub struct UserMutation;

#[Object]
impl UserMutation {
    async fn register_user(
        &self,
        ctx: &Context<'_>,
        input: RegisterUserInput,
    ) -> FieldResult<RegisterUserPayload> {
        let IdentityClaims {
            user_id: firebase_id,
            email,
            ..
        } = with_identity(ctx)?;
        if !email.ends_with("@uwblueprint.org") {
            let error = format_err!("invalid email domain");
            return Err(error.into());
        }

        let RegisterUserInput {
            first_name,
            last_name,
        } = input;

        let user = User::find_by_firebase_id(firebase_id)
            .load(ctx.entity())
            .await
            .context("failed to load user")?;
        let user = match user {
            Some(mut user) => {
                user.email = email.to_owned();
                user.first_name = first_name.to_owned();
                user.last_name = last_name.to_owned();
                user
            }
            None => User::builder()
                .firebase_id(firebase_id)
                .email(email)
                .first_name(first_name)
                .last_name(last_name)
                .build(),
        };
        user.save(ctx.entity())
            .await
            .context("failed to save user")?;

        let user = UserObject::from(user);
        let payload = RegisterUserPayload { user };
        Ok(payload)
    }
}

#[derive(Debug, Clone, InputObject)]
pub struct RegisterUserInput {
    first_name: String,
    last_name: String,
}

#[derive(Debug, Clone, SimpleObject)]
pub struct RegisterUserPayload {
    user: UserObject,
}
