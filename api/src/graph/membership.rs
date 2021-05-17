use super::prelude::*;

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
            .load(ctx.entity())
            .await
            .context("failed to load member roles")
            .into_field_result()?;
        let roles: Vec<_> = roles
            .try_collect()
            .await
            .context("failed to load member roles")
            .into_field_result()?;
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

        let role = MemberRole::builder()
            .name(name)
            .description(description)
            .build();
        role.save(ctx.entity())
            .await
            .context("failed to save member role")
            .into_field_result()?;

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
            .context("invalid member role ID")
            .into_field_result()?;
        let role = {
            let role = MemberRole::find(&role_id)
                .load(ctx.entity())
                .await
                .context("failed to load member role")
                .into_field_result()?
                .context("member role not found")
                .into_field_result()?;
            MemberRole {
                name,
                description,
                ..role
            }
        };
        role.save(ctx.entity())
            .await
            .context("failed to save member role")
            .into_field_result()?;

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
            .context("invalid member role ID")
            .into_field_result()?;
        let role = MemberRole::find(&role_id)
            .load(ctx.entity())
            .await
            .context("failed to load member role")?
            .context("member role not found")
            .into_field_result()?;
        role.delete(ctx.entity())
            .await
            .context("failed to delete member role")
            .into_field_result()?;

        let payload = DeleteMemberRolePayload {
            role_id: role.global_id().into(),
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
