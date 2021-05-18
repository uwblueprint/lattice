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

    async fn website_url(&self) -> Option<&String> {
        self.website_url.as_ref()
    }

    async fn twitter_handle(&self) -> Option<&String> {
        self.twitter_handle.as_ref()
    }

    async fn instagram_handle(&self) -> Option<&String> {
        self.instagram_handle.as_ref()
    }

    async fn bio(&self) -> Option<&String> {
        self.bio.as_ref()
    }

    async fn memberships(
        &self,
        ctx: &Context<'_>,
    ) -> FieldResult<Vec<MembershipObject>> {
        let memberships = self
            .0
            .memberships()
            .find(ctx.entity())
            .await
            .context("failed to find memberships")?;
        let memberships: Vec<_> = memberships
            .try_collect()
            .await
            .context("failed to load memberships")?;
        let memberships: Vec<_> = memberships
            .into_iter()
            .map(MembershipObject::from)
            .collect();
        Ok(memberships)
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
            .context("failed to load user")?;
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
            .find(ctx.entity())
            .await
            .context("failed to find users")?;
        let users: Vec<_> =
            users.try_collect().await.context("failed to load users")?;
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
            return Err(error.into());
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
            .context("failed to load user")?;
        let is_new_user = existing_user.is_none();

        let mut user = match existing_user {
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
            .context("failed to save user")?;

        let user = UserObject::from(user);
        let payload = RegisterUserPayload { user, is_new_user };
        Ok(payload)
    }

    async fn update_user(
        &self,
        ctx: &Context<'_>,
        input: UpdateUserInput,
    ) -> FieldResult<UpdateUserPayload> {
        let UpdateUserInput {
            user_id,
            bio,
            website_url,
            twitter_handle,
            instagram_handle,
        } = input;
        let user_id = user_id.get::<User>().ensure("invalid user ID")?;

        let viewer = with_viewer(ctx).await?;
        if viewer.id != user_id {
            let error = format_err!("not authorized");
            return Err(error.into());
        }

        let mut user = User {
            website_url,
            twitter_handle,
            instagram_handle,
            bio,
            ..viewer
        };
        user.save(ctx.entity())
            .await
            .context("failed to save user")?;

        let user = UserObject::from(user);
        let payload = UpdateUserPayload { user };
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

#[derive(Debug, Clone, InputObject)]
struct UpdateUserInput {
    user_id: NodeId,
    website_url: Option<String>,
    twitter_handle: Option<String>,
    instagram_handle: Option<String>,
    bio: Option<String>,
}

#[derive(Debug, Clone, SimpleObject)]
struct UpdateUserPayload {
    user: UserObject,
}
