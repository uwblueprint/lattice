import React, { FC, useMemo } from "react";
import { Controller } from "react-hook-form";
import { DateTime } from "luxon";
import { prepass } from "gqless";

import { Box } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { FormLabel, FormControl } from "@chakra-ui/react";
import { ButtonProps, Button } from "@chakra-ui/react";
import { Select } from "@chakra-ui/react";
import { ModalProps } from "@chakra-ui/react";
import { InputProps, Input } from "@chakra-ui/react";
import { SkeletonText } from "@chakra-ui/react";

import { TextareaAutosize } from "components";
import { Card, CardProps } from "components";
import { ModalTrigger } from "components";
import { EditModal, useEditModalForm, useEditModalMutations } from "components";
import { useQuery } from "components";

import { MemberRole, Membership } from "schema";
import { CreateMemberRoleInput, CreateMemberRolePayload } from "schema";
import { UpdateMemberRoleInput, UpdateMemberRolePayload } from "schema";
import { DeleteMemberRoleInput, DeleteMemberRolePayload } from "schema";
import { CreateMembershipInput, CreateMembershipPayload } from "schema";
import { UpdateMembershipInput, UpdateMembershipPayload } from "schema";
import { DeleteMembershipInput, DeleteMembershipPayload } from "schema";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export interface EditMemberRoleModalProps extends Omit<ModalProps, "children"> {
  role?: MemberRole;
  onCreate?: (payload: CreateMemberRolePayload) => void;
  onCreateRefetch?: unknown[];
  onUpdate?: (payload: UpdateMemberRolePayload) => void;
  onUpdateRefetch?: unknown[];
  onDelete?: (payload: DeleteMemberRolePayload) => void;
  onDeleteRefetch?: unknown[];
}

export const EditMemberRoleModal: FC<EditMemberRoleModalProps> = ({
  role,
  onCreate,
  onCreateRefetch,
  onUpdate,
  onUpdateRefetch,
  onDelete,
  onDeleteRefetch,
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
      prepass(payload.role, "id", "name", "description");
      return payload;
    },
    updateMutation: (mutation, args: UpdateMemberRoleInput) => {
      const payload = mutation.updateMemberRole({ input: args });
      prepass(payload.role, "id", "name", "description");
      return payload;
    },
    deleteMutation: (mutation, args: DeleteMemberRoleInput) => {
      const payload = mutation.deleteMemberRole({ input: args });
      prepass(payload, "roleId");
      return payload;
    },
    onCreate,
    onCreateRefetch,
    onUpdate,
    onUpdateRefetch,
    onDelete,
    onDeleteRefetch,
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
    Pick<
      EditMemberRoleModalProps,
      "onUpdate" | "onUpdateRefetch" | "onDelete" | "onDeleteRefetch"
    > {
  role: MemberRole;
  isLoading: boolean;
}

export const MemberRoleCard: FC<MemberRoleCardProps> = ({
  role,
  isLoading,
  onUpdate,
  onUpdateRefetch,
  onDelete,
  onDeleteRefetch,
  ...otherProps
}) => {
  const { name, description } = role;
  return (
    <ModalTrigger
      renderModal={(disclosure) => (
        <EditMemberRoleModal
          role={role}
          onUpdate={onUpdate}
          onUpdateRefetch={onUpdateRefetch}
          onDelete={onDelete}
          onDeleteRefetch={onDeleteRefetch}
          {...disclosure}
        />
      )}
    >
      {({ open }) => (
        <Card title={name} onClickEdit={open} {...otherProps}>
          {!isLoading ? (
            <Text color="gray.600" noOfLines={8}>
              {description}
            </Text>
          ) : (
            <SkeletonText noOfLines={4} />
          )}
        </Card>
      )}
    </ModalTrigger>
  );
};

export interface NewMemberRoleButtonProps
  extends ButtonProps,
    Pick<EditMemberRoleModalProps, "onCreate" | "onCreateRefetch"> {}

export const NewMemberRoleButton: FC<NewMemberRoleButtonProps> = ({
  onCreate,
  onCreateRefetch,
  ...otherProps
}) => {
  return (
    <ModalTrigger
      renderModal={(disclosure) => (
        <EditMemberRoleModal
          onCreate={onCreate}
          onCreateRefetch={onCreateRefetch}
          {...disclosure}
        />
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

export interface EditMembershipModalProps extends Omit<ModalProps, "children"> {
  userId?: string;
  membership?: Membership;
  onCreate?: (payload: CreateMembershipPayload) => void;
  onCreateRefetch?: unknown[];
  onUpdate?: (payload: UpdateMembershipPayload) => void;
  onUpdateRefetch?: unknown[];
  onDelete?: (payload: DeleteMembershipPayload) => void;
  onDeleteRefetch?: unknown[];
}

export const EditMembershipModal: FC<EditMembershipModalProps> = ({
  userId,
  membership,
  onCreate,
  onCreateRefetch,
  onUpdate,
  onUpdateRefetch,
  onDelete,
  onDeleteRefetch,
  onClose,
  ...otherProps
}) => {
  const subject = "membership";
  const { id: membershipId, role, start, end } = membership ?? {};

  const {
    memberRoles: roles,
    $state: { isLoading },
  } = useQuery({
    prepare: ({ query, prepass }) => {
      const { memberRoles: roles } = query;
      prepass(roles, "id", "name");
    },
  });

  const {
    create,
    update,
    delete: _delete,
    isCreating,
    isUpdating,
    isDeleting,
  } = useEditModalMutations({
    subject,
    createMutation: (mutation, args: CreateMembershipInput) => {
      const payload = mutation.createMembership({ input: args });
      prepass(
        payload.membership,
        "id",
        ["user", "id"],
        ["role", "id"],
        "start",
        "end"
      );
      return payload;
    },
    updateMutation: (mutation, args: UpdateMembershipInput) => {
      const payload = mutation.updateMembership({ input: args });
      prepass(payload.membership, "id", ["role", "id"], "start", "end");
      return payload;
    },
    deleteMutation: (mutation, args: DeleteMembershipInput) => {
      const payload = mutation.deleteMembership({ input: args });
      prepass(payload, "membershipId");
      return payload;
    },
    onCreate,
    onCreateRefetch,
    onUpdate,
    onUpdateRefetch,
    onDelete,
    onDeleteRefetch,
    onClose,
  });

  const {
    register,
    watch,
    reset,
    control,
    handleSubmit,
    formState,
  } = useEditModalForm<{
    roleId: string;
    start: string;
    end: string;
  }>({ key: membershipId });
  const onSubmit = handleSubmit(async (values) => {
    if (membershipId) {
      await update({ args: { membershipId, ...values } });
    } else {
      if (!userId) {
        throw new Error("Missing user ID.");
      }
      await create({ args: { userId, ...values } });
    }
    reset();
  });

  const startValue = watch("start", "");
  return (
    <EditModal
      subject={subject}
      mode={membership ? "update" : "create"}
      formState={formState}
      isCreating={isCreating}
      isUpdating={isUpdating}
      isDeleting={isDeleting}
      onClose={onClose}
      onSubmit={onSubmit}
      onDelete={() => {
        if (membershipId) {
          _delete({ args: { membershipId } });
        }
      }}
      {...otherProps}
    >
      <FormControl isRequired>
        <FormLabel>Role</FormLabel>
        <Select
          placeholder={isLoading ? "Loading..." : "Select role"}
          defaultValue={role?.id ?? ""}
          isDisabled={isLoading}
          {...register("roleId", { required: true })}
        >
          {roles.map(({ id, name }, index) => (
            <option key={id ?? index} value={id}>
              {name}
            </option>
          ))}
        </Select>
      </FormControl>
      <FormControl isRequired>
        <FormLabel>From</FormLabel>
        <Controller
          control={control}
          name="start"
          rules={{ required: true }}
          defaultValue={start}
          render={({ field: { value, onChange, onBlur } }) => (
            <DateInput
              value={value}
              placeholder="Pick a date"
              onChange={onChange}
              onBlur={onBlur}
            />
          )}
        />
      </FormControl>
      <FormControl isRequired>
        <FormLabel>Until</FormLabel>
        <Controller
          control={control}
          name="end"
          rules={{ required: true }}
          defaultValue={end}
          render={({ field: { value, onChange, onBlur } }) => (
            <DateInput
              value={value}
              placeholder="Pick a date"
              minDate={startValue}
              isDisabled={!startValue}
              onChange={onChange}
              onBlur={onBlur}
            />
          )}
        />
      </FormControl>
    </EditModal>
  );
};

interface DateInputProps extends Omit<InputProps, "value" | "onChange"> {
  value?: string;
  onChange?: (value: string) => void;
  minDate?: string;
  maxDate?: string;
}

const DateInput: FC<DateInputProps> = ({
  value,
  placeholder,
  minDate: minDateString,
  maxDate: maxDateString,
  isDisabled,
  onChange,
  onBlur,
  ...otherProps
}) => {
  const selected = useMemo(() => {
    if (value) {
      return DateTime.fromISO(value).toJSDate();
    }
  }, [value]);

  const minDate = useMemo(() => {
    if (minDateString) {
      return DateTime.fromISO(minDateString).toJSDate();
    }
  }, [minDateString]);

  const maxDate = useMemo(() => {
    if (maxDateString) {
      return DateTime.fromISO(maxDateString).toJSDate();
    }
  }, [maxDateString]);

  return (
    <Box
      sx={{
        "> *": {
          display: "block",
        },
      }}
    >
      <DatePicker
        customInput={
          <Input autoComplete="off" {...{ isDisabled }} {...otherProps} />
        }
        selected={selected}
        placeholderText={placeholder}
        minDate={minDate}
        maxDate={maxDate}
        disabled={isDisabled}
        onChange={(date) => {
          if (!onChange) {
            return;
          }
          const selected = Array.isArray(date) ? date[0] : date;
          if (selected) {
            onChange(DateTime.fromJSDate(selected).toISODate());
          } else {
            onChange("");
          }
        }}
        onBlur={onBlur}
      />
    </Box>
  );
};

export interface MembershipCardProps
  extends Omit<CardProps, "membership">,
    Pick<
      EditMembershipModalProps,
      "onUpdate" | "onUpdateRefetch" | "onDelete" | "onDeleteRefetch"
    > {
  membership: Membership;
  isLoading: boolean;
}

export const MembershipCard: FC<MembershipCardProps> = ({
  membership,
  isLoading,
  onUpdate,
  onUpdateRefetch,
  onDelete,
  onDeleteRefetch,
  ...otherProps
}) => {
  const { role, start, end } = membership;
  const { name: roleName } = role;
  return (
    <ModalTrigger
      renderModal={(disclosure) => (
        <EditMembershipModal
          membership={membership}
          onUpdate={onUpdate}
          onUpdateRefetch={onUpdateRefetch}
          onDelete={onDelete}
          onDeleteRefetch={onDeleteRefetch}
          {...disclosure}
        />
      )}
    >
      {({ open }) => (
        <Card title={roleName} spacing={1} onClickEdit={open} {...otherProps}>
          {!isLoading ? (
            <>
              <Text>From: {start}</Text>
              <Text>Until: {end}</Text>
            </>
          ) : (
            <SkeletonText noOfLines={4} />
          )}
        </Card>
      )}
    </ModalTrigger>
  );
};

export interface NewMembershipButtonProps
  extends ButtonProps,
    Pick<EditMembershipModalProps, "onCreate" | "onCreateRefetch"> {
  userId: EditMembershipModalProps["userId"];
}

export const NewMembershipButton: FC<NewMembershipButtonProps> = ({
  userId,
  onCreate,
  onCreateRefetch,
  ...otherProps
}) => {
  return (
    <ModalTrigger
      renderModal={(disclosure) => (
        <EditMembershipModal
          userId={userId}
          onCreate={onCreate}
          onCreateRefetch={onCreateRefetch}
          {...disclosure}
        />
      )}
    >
      {({ open }) => (
        <Button
          colorScheme="blue"
          alignSelf="start"
          onClick={open}
          {...otherProps}
        >
          New Membership
        </Button>
      )}
    </ModalTrigger>
  );
};
