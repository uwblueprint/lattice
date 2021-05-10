import React, { FC, useEffect } from "react";
import { selectFields } from "gqless";
import { useForm } from "react-hook-form";

import { HiTrash } from "react-icons/hi";

import { VStack } from "@chakra-ui/react";
import { Text, Icon, IconButton } from "@chakra-ui/react";
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
import { useNotify } from "components";
import { useMutation } from "components";

import {
  MemberRole,
  CreateMemberRoleInput,
  CreateMemberRolePayload,
  UpdateMemberRoleInput,
  UpdateMemberRolePayload,
  DeleteMemberRoleInput,
} from "schema";
import { ModalTrigger } from "./modal";

export interface MemberRoleCardProps extends Omit<CardProps, "role"> {
  role: MemberRole | undefined;
  onDelete?: () => void;
}

export const MemberRoleCard: FC<MemberRoleCardProps> = ({
  role,
  onDelete,
  ...otherProps
}) => {
  const { name, description } = role ?? {};
  const notify = useNotify();

  const [deleteRole] = useMutation(
    (mutation, args: DeleteMemberRoleInput) => {
      const { roleId, ...otherFields } = mutation.deleteMemberRole({
        input: args,
      });
      return { roleId, ...otherFields };
    },
    {
      onCompleted: () => {
        notify({
          status: "success",
          description: "Member role deleted",
        });
        if (onDelete) {
          onDelete();
        }
      },
      onError: ({ message }) => {
        notify({
          status: "error",
          title: "Failed to delete member role",
          description: message,
        });
      },
    }
  );

  return (
    <ModalTrigger
      renderModal={(disclosure) => (
        <EditMemberRoleModal role={role} {...disclosure} />
      )}
    >
      {({ open }) => (
        <Card
          title={name}
          actions={["edit", "remove"]}
          onClickEdit={open}
          onClickRemove={() => {
            if (role?.id) {
              deleteRole({
                args: {
                  roleId: role.id,
                },
              });
            }
          }}
          {...otherProps}
        >
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
}

export const EditMemberRoleModal: FC<EditMemberRoleModalProps> = ({
  role,
  onCreate,
  onUpdate,
  onClose,
  ...otherProps
}) => {
  const notify = useNotify();

  const [createRole] = useMutation(
    (mutation, args: CreateMemberRoleInput) => {
      const { role, ...otherFields } = mutation.createMemberRole({
        input: args,
      });
      return {
        role: selectFields(role, ["id", "name", "description"]),
        ...otherFields,
      };
    },
    {
      onCompleted: (payload) => {
        notify({
          status: "success",
          description: "Member role created",
        });
        if (onCreate) {
          onCreate(payload);
        }
        onClose();
      },
      onError: ({ message }) => {
        notify({
          status: "error",
          title: "Failed to create member role",
          description: message,
        });
      },
    }
  );

  const [updateRole] = useMutation(
    (mutation, args: UpdateMemberRoleInput) => {
      const { role, ...otherFields } = mutation.updateMemberRole({
        input: args,
      });
      return {
        role: selectFields(role, ["id", "name", "description"]),
        ...otherFields,
      };
    },
    {
      onCompleted: (payload) => {
        notify({
          status: "success",
          description: "Member role updated",
        });
        if (onUpdate) {
          onUpdate(payload);
        }
        onClose();
      },
      onError: ({ message }) => {
        notify({
          status: "error",
          title: "Failed to update member role",
          description: message,
        });
      },
    }
  );

  const { register, handleSubmit, reset } = useForm<{
    name: string;
    description: string;
  }>();
  useEffect(
    () => reset(),
    [role] /* eslint-disable-line react-hooks/exhaustive-deps */
  );

  const onSubmit = handleSubmit((values) => {
    if (role?.id) {
      updateRole({
        args: {
          roleId: role.id,
          ...values,
        },
      });
    } else {
      createRole({
        args: values,
      });
    }
  });

  const { name, description } = role ?? {};
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
              {...register("name")}
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
              {...register("description")}
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button type="submit" colorScheme="blue">
            {role ? "Update" : "Create"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
