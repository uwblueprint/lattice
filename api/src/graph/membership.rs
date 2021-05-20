use super::prelude::*;

#[derive(Debug, Clone, From, Deref)]
pub struct MembershipObject(Membership);

#[Object(name = "Membership")]
impl MembershipObject {
    async fn id(&self) -> NodeId {
        self.global_id().into()
    }

    async fn created_at(&self) -> &DateTime {
        &self.created_at
    }

    async fn updated_at(&self) -> &DateTime {
        &self.updated_at
    }

    async fn start(&self) -> &DateTime {
        &self.start
    }

    async fn end(&self) -> &DateTime {
        &self.end
    }

    async fn user(&self, ctx: &Context<'_>) -> FieldResult<UserObject> {
        let user = self
            .0
            .user()
            .load(ctx.entity())
            .await
            .extend("failed to load user")?
            .ensure("user not found")?;
        let user = UserObject::from(user);
        Ok(user)
    }

    async fn role(&self, ctx: &Context<'_>) -> FieldResult<MemberRoleObject> {
        let role = self
            .0
            .role()
            .load(ctx.entity())
            .await
            .extend("failed to load member role")?
            .ensure("member role not found")?;
        let role = MemberRoleObject::from(role);
        Ok(role)
    }
}

#[derive(Debug, Clone, From, Deref)]
pub struct MemberRoleObject(MemberRole);

#[Object(name = "MemberRole")]
impl MemberRoleObject {
    async fn id(&self) -> NodeId {
        self.global_id().into()
    }

    async fn created_at(&self) -> &DateTime {
        &self.created_at
    }

    async fn updated_at(&self) -> &DateTime {
        &self.updated_at
    }

    async fn name(&self) -> &String {
        &self.name
    }

    async fn description(&self) -> &String {
        &self.description
    }
}

#[derive(Debug, Clone)]
pub struct MembershipQueries;

#[Object]
impl MembershipQueries {
    async fn member_roles(
        &self,
        ctx: &Context<'_>,
    ) -> FieldResult<Vec<MemberRoleObject>> {
        let roles = MemberRole::all()
            .find(ctx.entity())
            .await
            .extend("failed to find member roles")?;
        let roles: Vec<_> = roles
            .try_collect()
            .await
            .extend("failed to load member roles")?;
        let roles: Vec<_> =
            roles.into_iter().map(MemberRoleObject::from).collect();
        Ok(roles)
    }
}

#[derive(Debug, Clone)]
pub struct MembershipMutations;

#[Object]
impl MembershipMutations {
    async fn create_member_role(
        &self,
        ctx: &Context<'_>,
        input: CreateMemberRoleInput,
    ) -> FieldResult<CreateMemberRolePayload> {
        let CreateMemberRoleInput { name, description } = input;

        let mut role = MemberRole::builder()
            .name(name)
            .description(description)
            .build();
        role.save(ctx.entity())
            .await
            .extend("failed to save member role")?;

        let role = MemberRoleObject::from(role);
        let payload = CreateMemberRolePayload { role };
        Ok(payload)
    }

    async fn update_member_role(
        &self,
        ctx: &Context<'_>,
        input: UpdateMemberRoleInput,
    ) -> FieldResult<UpdateMemberRolePayload> {
        let UpdateMemberRoleInput {
            role_id,
            name,
            description,
        } = input;

        let role_id = role_id
            .get::<MemberRole>()
            .ensure("invalid member role ID")?;
        let role = MemberRole::find(&role_id)
            .load(ctx.entity())
            .await
            .extend("failed to load member role")?
            .ensure("member role not found")?;

        let mut role = MemberRole {
            name,
            description,
            ..role
        };
        role.save(ctx.entity())
            .await
            .extend("failed to save member role")?;

        let role = MemberRoleObject::from(role);
        let payload = UpdateMemberRolePayload { role };
        Ok(payload)
    }

    async fn delete_member_role(
        &self,
        ctx: &Context<'_>,
        input: DeleteMemberRoleInput,
    ) -> FieldResult<DeleteMemberRolePayload> {
        let DeleteMemberRoleInput { role_id } = input;

        let role_id = role_id
            .get::<MemberRole>()
            .ensure("invalid member role ID")?;
        let mut role = MemberRole::find(&role_id)
            .load(ctx.entity())
            .await
            .extend("failed to load member role")?
            .ensure("member role not found")?;
        role.delete(ctx.entity())
            .await
            .extend("failed to delete member role")?;

        let payload = DeleteMemberRolePayload {
            role_id: role.global_id().into(),
        };
        Ok(payload)
    }

    async fn create_membership(
        &self,
        ctx: &Context<'_>,
        input: CreateMembershipInput,
    ) -> FieldResult<CreateMembershipPayload> {
        let CreateMembershipInput {
            user_id,
            role_id,
            start,
            end,
        } = input;
        let role_id = role_id.get::<MemberRole>().ensure("invalid member role ID")?;
        let user_id = user_id.get::<User>().ensure("invalid user ID")?;

        let viewer = with_viewer(ctx).await?;
        if viewer.id != user_id {
            let error = format_err!("not authorized");
            return Err(error.into());
        }

        let mut membership = Membership::builder()
            .user_id(user_id)
            .role_id(role_id)
            .start(start)
            .end(end)
            .build();
        membership
            .save(ctx.entity())
            .await
            .extend("failed to save membership")?;

        let membership = MembershipObject::from(membership);
        let payload = CreateMembershipPayload { membership };
        Ok(payload)
    }

    async fn update_membership(
        &self,
        ctx: &Context<'_>,
        input: UpdateMembershipInput,
    ) -> FieldResult<UpdateMembershipPayload> {
        let UpdateMembershipInput {
            membership_id,
            role_id,
            start,
            end,
        } = input;

        let membership_id = membership_id
            .get::<Membership>()
            .ensure("invalid membership ID")?;
        let membership = Membership::find(&membership_id)
            .load(ctx.entity())
            .await
            .extend("failed to load membership")?
            .ensure("membership not found")?;

        let user_id = membership.user_id.clone();
        let role_id = role_id.get::<User>().ensure("invalid role ID")?;

        let viewer = with_viewer(ctx).await?;
        if viewer.id != user_id {
            let error = format_err!("not authorized");
            return Err(error.into());
        }

        let mut membership = Membership {
            role_id,
            start,
            end,
            ..membership
        };
        membership
            .save(ctx.entity())
            .await
            .extend("failed to save membership")?;

        let membership = MembershipObject::from(membership);
        let payload = UpdateMembershipPayload { membership };
        Ok(payload)
    }

    async fn delete_membership(
        &self,
        ctx: &Context<'_>,
        input: DeleteMembershipInput,
    ) -> FieldResult<DeleteMembershipPayload> {
        let DeleteMembershipInput { membership_id } = input;

        let membership_id = membership_id
            .get::<Membership>()
            .ensure("invalid membership ID")?;
        let mut membership = Membership::find(&membership_id)
            .load(ctx.entity())
            .await
            .extend("failed to load membership")?
            .ensure("membership not found")?;
        membership
            .delete(ctx.entity())
            .await
            .extend("failed to delete membership")?;

        let payload = DeleteMembershipPayload {
            membership_id: membership.global_id().into(),
        };
        Ok(payload)
    }
}

#[derive(Debug, Clone, InputObject)]
struct CreateMemberRoleInput {
    name: String,
    description: String,
}

#[derive(Debug, Clone, SimpleObject)]
struct CreateMemberRolePayload {
    role: MemberRoleObject,
}

#[derive(Debug, Clone, InputObject)]
struct UpdateMemberRoleInput {
    role_id: NodeId,
    name: String,
    description: String,
}

#[derive(Debug, Clone, SimpleObject)]
struct UpdateMemberRolePayload {
    role: MemberRoleObject,
}

#[derive(Debug, Clone, InputObject)]
struct DeleteMemberRoleInput {
    role_id: NodeId,
}

#[derive(Debug, Clone, SimpleObject)]
struct DeleteMemberRolePayload {
    role_id: NodeId,
}

#[derive(Debug, Clone, InputObject)]
struct CreateMembershipInput {
    user_id: NodeId,
    role_id: NodeId,

    start: DateTime,
    end: DateTime,
}

#[derive(Debug, Clone, SimpleObject)]
struct CreateMembershipPayload {
    membership: MembershipObject,
}

#[derive(Debug, Clone, InputObject)]
struct UpdateMembershipInput {
    membership_id: NodeId,
    role_id: NodeId,

    start: DateTime,
    end: DateTime,
}

#[derive(Debug, Clone, SimpleObject)]
struct UpdateMembershipPayload {
    membership: MembershipObject,
}

#[derive(Debug, Clone, InputObject)]
struct DeleteMembershipInput {
    membership_id: NodeId,
}

#[derive(Debug, Clone, SimpleObject)]
struct DeleteMembershipPayload {
    membership_id: NodeId,
}
