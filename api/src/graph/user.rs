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
pub struct UserQueries;

#[Object]
impl UserQueries {
    async fn viewer(
        &self,
        ctx: &Context<'_>,
    ) -> FieldResult<Option<UserObject>> {
        let email = match ctx.data_opt::<Identity>() {
            Some(identity) => {
                let IdentityClaims { email, .. } = identity.claims();
                email.as_str()
            }
            None => return Ok(None),
        };
        let user = User::find_by_email(email)
            .load(ctx.entity())
            .await
            .context("failed to load user")
            .into_field_result()?;
        let user = user.map(UserObject::from);
        Ok(user)
    }

    // TODO: Paginate!
    async fn users(
        &self,
        ctx: &Context<'_>,
        query: Option<String>,
    ) -> FieldResult<Vec<UserObject>> {
        let conditions = UserConditions::builder().query(query).build();
        let users = User::filter(conditions)
            .load(ctx.entity())
            .await
            .context("failed to load users")
            .into_field_result()?;
        let users: Vec<_> = users
            .try_collect()
            .await
            .context("failed to load users")
            .into_field_result()?;
        let users: Vec<_> = users.into_iter().map(UserObject::from).collect();
        Ok(users)
    }
}

#[derive(Debug, Clone)]
pub struct UserMutations;

#[Object]
impl UserMutations {
    async fn register_user(
        &self,
        ctx: &Context<'_>,
        input: RegisterUserInput,
    ) -> FieldResult<RegisterUserPayload> {
        let IdentityClaims { email, .. } = with_identity(ctx)?;
        if !email.ends_with("@uwblueprint.org") {
            let error = format_err!("invalid email domain");
            return Err(error).into_field_result();
        }

        let RegisterUserInput {
            first_name,
            last_name,
            phone,
            photo_url,
        } = input;

        let existing_user = User::find_by_email(email)
            .load(ctx.entity())
            .await
            .context("failed to load user")
            .into_field_result()?;
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
                .first_name(first_name)
                .last_name(last_name)
                .email(email)
                .phone(phone)
                .photo_url(photo_url)
                .build(),
        };
        user.save(ctx.entity())
            .await
            .context("failed to save user")
            .into_field_result()?;

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
