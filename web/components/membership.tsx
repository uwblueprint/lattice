import React, { FC, useEffect } from "react";
import { getFields } from "gqless";
import { useForm } from "react-hook-form";

import { VStack, HStack } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { FormLabel, FormControl } from "@chakra-ui/react";
import { Input } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";

import {
  ModalProps,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";

import { TextareaAutosize } from "components";
import { Card, CardProps } from "components";
import { ModalTrigger } from "components";
import { useMutationToast } from "components";
import { useMutation } from "components";

import {
  MemberRole,
  CreateMemberRoleInput,
  CreateMemberRolePayload,
  UpdateMemberRoleInput,
  UpdateMemberRolePayload,
  DeleteMemberRoleInput,
  DeleteMemberRolePayload,
} from "schema";

export interface MemberRoleCardProps extends Omit<CardProps, "role"> {
  role: MemberRole | undefined;
}

export const MemberRoleCard: FC<MemberRoleCardProps> = ({
  role,
  ...otherProps
}) => {
  const { name, description } = role ?? {};
  return (
    <ModalTrigger
      renderModal={(disclosure) => (
        <EditMemberRoleModal role={role} {...disclosure} />
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
  const { id: roleId, name, description } = role ?? {};

  const createRoleCallbacks = useMutationToast({
    subject: "member role",
    action: "create",
    onCompleted: (payload: CreateMemberRolePayload) => {
      if (onCreate) {
        onCreate(payload);
      }
      onClose();
    },
  });
  const [createRole] = useMutation(
    (mutation, args: CreateMemberRoleInput) => {
      const payload = mutation.createMemberRole({
        input: args,
      });
      getFields(payload.role, "id", "name", "description");
      return payload;
    },
    { ...createRoleCallbacks }
  );

  const updateRoleCallbacks = useMutationToast({
    subject: "member role",
    action: "update",
    onCompleted: (payload: UpdateMemberRolePayload) => {
      if (onUpdate) {
        onUpdate(payload);
      }
      onClose();
    },
  });
  const [updateRole] = useMutation(
    (mutation, args: UpdateMemberRoleInput) => {
      const { role, ...otherFields } = mutation.updateMemberRole({
        input: args,
      });
      return {
        role: getFields(role, "id", "name", "description"),
        ...otherFields,
      };
    },
    { ...updateRoleCallbacks }
  );

  const deleteRoleCallbacks = useMutationToast({
    subject: "member role",
    action: "delete",
    onCompleted: (payload: DeleteMemberRolePayload) => {
      if (onDelete) {
        onDelete(payload);
      }
      close();
    },
  });
  const [deleteRole] = useMutation(
    (mutation, args: DeleteMemberRoleInput) => {
      const { roleId, ...otherFields } = mutation.deleteMemberRole({
        input: args,
      });
      return { roleId, ...otherFields };
    },
    { ...deleteRoleCallbacks }
  );

  const {
    register,
    trigger,
    reset,
    watch,
    handleSubmit,
    formState: { isValid, isValidating, isDirty },
  } = useForm<{
    name: string;
    description: string;
  }>({
    mode: "all",
  });
  useEffect(
    () => {
      if (roleId) {
        reset();
      }
    },
    [roleId] /* eslint-disable-line react-hooks/exhaustive-deps */
  );

  const values = watch();
  useEffect(
    () => {
      if (!isDirty && !isValid && !isValidating) {
        trigger();
      }
    },
    [values] /* eslint-disable-line react-hooks/exhaustive-deps */
  );

  const onSubmit = handleSubmit(async (values) => {
    if (roleId) {
      await updateRole({ args: { roleId, ...values } });
    } else {
      await createRole({ args: values });
    }
    reset();
  });

  return (
    <Modal onClose={onClose} {...otherProps}>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={onSubmit}>
        <ModalHeader>{role ? "Edit" : "New"} Member Role</ModalHeader>
        <ModalCloseButton />
        <ModalBody as={VStack} align="stretch" spacing={4}>
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
        </ModalBody>
        <ModalFooter as={HStack}>
          {roleId && (
            <Button
              variant="outline"
              colorScheme="red"
              onClick={() => {
                deleteRole({ args: { roleId } });
              }}
            >
              Delete
            </Button>
          )}
          <Button type="submit" colorScheme="green" isDisabled={!isValid}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
