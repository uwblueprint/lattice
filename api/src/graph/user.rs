use super::prelude::*;

#[derive(Debug, Clone, From, Deref)]
pub struct UserObject(User);

// TODO: Use macros to generate simple getters.
#[Object(name = "User")]
impl UserObject {
    async fn id(&self) -> NodeId {
        self.global_id().into()
    }

    async fn created_at(&self) -> &DateTime {
        &self.created_at
    }

    async fn updated_at(&self) -> &DateTime {
        &self.updated_at
    }

    async fn first_name(&self) -> &String {
        &self.first_name
    }

    async fn last_name(&self) -> &String {
        &self.last_name
    }

    async fn full_name(&self) -> String {
        format!("{} {}", &self.first_name, &self.last_name)
    }

    async fn email(&self) -> &String {
        &self.email
    }

    async fn phone(&self) -> Option<&String> {
        self.phone.as_ref()
    }

    async fn photo_url(&self) -> Option<&String> {
        self.photo_url.as_ref()
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
            phone,
            photo_url,
        } = input;

        let existing_user = User::find_by_firebase_id(firebase_id)
            .load(ctx.entity())
            .await
            .context("failed to load user")?;
        let is_new_user = existing_user.is_none();

        let user = match existing_user {
            Some(user) => User {
                first_name,
                last_name,
                email: email.to_owned(),
                phone,
                photo_url,
                ..user
            },
            None => User::builder()
                .firebase_id(firebase_id)
                .first_name(first_name)
                .last_name(last_name)
                .email(email)
                .phone(phone)
                .photo_url(photo_url)
                .build(),
        };
        user.save(ctx.entity())
            .await
            .context("failed to save user")?;

        let user = UserObject::from(user);
        let payload = RegisterUserPayload { user, is_new_user };
        Ok(payload)
    }
}

#[derive(Debug, Clone, InputObject)]
struct RegisterUserInput {
    first_name: String,
    last_name: String,
    phone: Option<String>,
    photo_url: Option<String>,
}

#[derive(Debug, Clone, SimpleObject)]
struct RegisterUserPayload {
    user: UserObject,
    is_new_user: bool,
}
