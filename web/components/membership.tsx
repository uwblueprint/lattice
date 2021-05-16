import React, { FC } from "react";
import { getFields } from "gqless";

import { Text } from "@chakra-ui/react";
import { FormLabel, FormControl } from "@chakra-ui/react";
import { Input } from "@chakra-ui/react";
import { ButtonProps, Button } from "@chakra-ui/react";
import { ModalProps } from "@chakra-ui/react";

import { TextareaAutosize } from "components";
import { Card, CardProps } from "components";
import { ModalTrigger } from "components";
import { EditModal, useEditModalForm, useEditModalMutations } from "components";

import {
  MemberRole,
  CreateMemberRoleInput,
  CreateMemberRolePayload,
  UpdateMemberRoleInput,
  UpdateMemberRolePayload,
  DeleteMemberRoleInput,
  DeleteMemberRolePayload,
} from "schema";

export interface EditMemberRoleModalProps extends Omit<ModalProps, "children"> {
  role?: MemberRole;
  onCreate?: (payload: CreateMemberRolePayload) => void;
  onUpdate?: (payload: UpdateMemberRolePayload) => void;
  onDelete?: (payload: DeleteMemberRolePayload) => void;
}

export const EditMemberRoleModal: FC<EditMemberRoleModalProps> = ({
  role,
  onCreate,
  onUpdate,
  onDelete,
  onClose,
  ...otherProps
}) => {
  const subject = "member role";
  const { id: roleId, name, description } = role ?? {};

  const {
    create,
    update,
    delete: _delete,
    isCreating,
    isUpdating,
    isDeleting,
  } = useEditModalMutations({
    subject,
    createMutation: (mutation, args: CreateMemberRoleInput) => {
      const payload = mutation.createMemberRole({ input: args });
      getFields(payload.role, "id", "name", "description");
      return payload;
    },
    updateMutation: (mutation, args: UpdateMemberRoleInput) => {
      const payload = mutation.updateMemberRole({ input: args });
      getFields(payload.role, "id", "name", "description");
      return payload;
    },
    deleteMutation: (mutation, args: DeleteMemberRoleInput) => {
      const payload = mutation.deleteMemberRole({ input: args });
      getFields(payload, "roleId");
      return payload;
    },
    onCreate,
    onUpdate,
    onDelete,
    onClose,
  });

  const { register, reset, handleSubmit, formState } = useEditModalForm<{
    name: string;
    description: string;
  }>({ key: roleId });
  const onSubmit = handleSubmit(async (values) => {
    if (roleId) {
      await update({ args: { roleId, ...values } });
    } else {
      await create({ args: values });
    }
    reset();
  });

  return (
    <EditModal
      subject={subject}
      mode={role ? "update" : "create"}
      formState={formState}
      isCreating={isCreating}
      isUpdating={isUpdating}
      isDeleting={isDeleting}
      onClose={onClose}
      onSubmit={onSubmit}
      onDelete={() => {
        if (roleId) {
          _delete({ args: { roleId } });
        }
      }}
      {...otherProps}
    >
      <FormControl isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          defaultValue={name}
          placeholder="President"
          {...register("name", { required: true })}
        />
      </FormControl>
      <FormControl isRequired>
        <FormLabel>Description</FormLabel>
        <TextareaAutosize
          defaultValue={description}
          placeholder={
            "The President is the leader of Blueprint and its chief " +
            "representative. They are ultimately responsible for the " +
            "success of all aspects of Blueprint. They set the direction " +
            "for the club, uphold  club values and mission, and manage " +
            "the day-to-day operations of the executive team. You can’t " +
            "run a club without a president, so if you really want to " +
            "drive the vision and execute on new ideas, this might be the " +
            "fit for you."
          }
          minRows={8}
          maxRows={12}
          {...register("description", { required: true })}
        />
      </FormControl>
    </EditModal>
  );
};

export interface MemberRoleCardProps
  extends Omit<CardProps, "role">,
    Pick<EditMemberRoleModalProps, "onUpdate" | "onDelete"> {
  role: MemberRole | undefined;
}

export const MemberRoleCard: FC<MemberRoleCardProps> = ({
  role,
  onUpdate,
  onDelete,
  ...otherProps
}) => {
  const { name, description } = role ?? {};
  return (
    <ModalTrigger
      renderModal={(disclosure) => (
        <EditMemberRoleModal
          role={role}
          onUpdate={onUpdate}
          onDelete={onDelete}
          {...disclosure}
        />
      )}
    >
      {({ open }) => (
        <Card title={name} onClickEdit={open} {...otherProps}>
          <Text color="gray.600" noOfLines={8}>
            {description}
          </Text>
        </Card>
      )}
    </ModalTrigger>
  );
};

export interface NewMemberRoleButtonProps
  extends ButtonProps,
    Pick<EditMemberRoleModalProps, "onCreate"> {}

export const NewMemberRoleButton: FC<NewMemberRoleButtonProps> = ({
  onCreate,
  ...otherProps
}) => {
  return (
    <ModalTrigger
      renderModal={(disclosure) => (
        <EditMemberRoleModal onCreate={onCreate} {...disclosure} />
      )}
    >
      {({ open }) => (
        <Button
          colorScheme="blue"
          alignSelf="start"
          onClick={open}
          {...otherProps}
        >
          New Role
        </Button>
      )}
    </ModalTrigger>
  );
};
