import React, { FC, ReactNode, HTMLProps } from "react";
import { titleCase } from "voca";

import { useEffect } from "react";
import {
  FieldValues,
  FormState,
  useForm,
  UseFormProps,
  UseFormReturn,
} from "react-hook-form";

import { StackProps, VStack, HStack } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import { useDisclosure, UseDisclosureReturn } from "@chakra-ui/react";

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

import { useMutation, useMutationToast } from "components";
import { GeneratedSchema } from "schema";

export interface ModalTriggerChildrenProps {
  open: UseDisclosureReturn["onOpen"];
  isOpen: boolean;
}

export interface ModalTriggerProps {
  renderModal: (disclosure: UseDisclosureReturn) => ReactNode;
  children: (props: ModalTriggerChildrenProps) => ReactNode;
}

export const ModalTrigger: FC<ModalTriggerProps> = ({
  renderModal,
  children,
}) => {
  const disclosure = useDisclosure();
  const { isOpen, onOpen: open } = disclosure;
  return (
    <>
      {children({ open, isOpen })}
      {renderModal(disclosure)}
    </>
  );
};

export interface EditModalProps
  extends ModalProps,
    Pick<StackProps, "spacing"> {
  subject: string;
  mode: "create" | "update";
  formState: FormState<FieldValues>;
  isCreating?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
  onSubmit: HTMLProps<HTMLFormElement>["onSubmit"];
  onDelete?: HTMLProps<HTMLButtonElement>["onClick"];
}

export const EditModal: FC<EditModalProps> = ({
  subject,
  mode,
  formState,
  isCreating,
  isUpdating,
  isDeleting,
  onClose,
  onSubmit,
  onDelete,
  spacing = 4,
  children,
  ...otherProps
}) => {
  const renderTitle = () => {
    const s = titleCase(subject);
    switch (mode) {
      case "create":
        return `New ${s}`;
      case "update":
        return `Edit ${s}`;
    }
  };
  return (
    <Modal onClose={onClose} {...otherProps}>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={onSubmit}>
        <ModalHeader>{renderTitle()}</ModalHeader>
        <ModalCloseButton />
        <ModalBody as={VStack} align="stretch" spacing={spacing}>
          {children}
        </ModalBody>
        <ModalFooter as={HStack}>
          {mode === "update" && !!onDelete && (
            <Button
              variant="outline"
              colorScheme="red"
              isLoading={isDeleting}
              onClick={onDelete}
            >
              Delete
            </Button>
          )}
          <Button
            type="submit"
            colorScheme="green"
            isLoading={isUpdating || isCreating}
            isDisabled={!formState.isValid}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

type MutationFn<TData = unknown, TArgs = undefined> = (
  mutation: GeneratedSchema["mutation"],
  args: TArgs
) => TData;

type MutationHandler<TData = unknown> = (data: TData) => void;

export interface EditModalMutationsOptions<
  TCreateData,
  TCreateArgs,
  TUpdateData,
  TUpdateArgs,
  TDeleteData,
  TDeleteArgs
> {
  subject: string;
  createMutation: MutationFn<TCreateData, TCreateArgs>;
  updateMutation: MutationFn<TUpdateData, TUpdateArgs>;
  deleteMutation: MutationFn<TDeleteData, TDeleteArgs>;
  onCreate: MutationHandler<TCreateData> | undefined;
  onCreateRefetch?: unknown[];
  onUpdate: MutationHandler<TUpdateData> | undefined;
  onUpdateRefetch?: unknown[];
  onDelete: MutationHandler<TDeleteData> | undefined;
  onDeleteRefetch?: unknown[];
  onClose: () => void;
}

type Mutation<TData = unknown, TArgs = undefined> = (
  ...opts: undefined extends TArgs
    ? [
        {
          fn?: (mutation: GeneratedSchema["mutation"], args: TArgs) => TData;
          args?: TArgs;
        }?
      ]
    : [
        {
          fn?: (mutation: GeneratedSchema["mutation"], args: TArgs) => TData;
          args: TArgs;
        }
      ]
) => Promise<TData>;

export interface EditModalMutations<
  TCreateData,
  TCreateArgs,
  TUpdateData,
  TUpdateArgs,
  TDeleteData,
  TDeleteArgs
> {
  create: Mutation<TCreateData, TCreateArgs>;
  update: Mutation<TUpdateData, TUpdateArgs>;
  delete: Mutation<TDeleteData, TDeleteArgs>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isLoading: boolean;
}

export const useEditModalMutations = <
  TCreateData,
  TCreateArgs,
  TUpdateData,
  TUpdateArgs,
  TDeleteData,
  TDeleteArgs
>({
  subject,
  createMutation,
  updateMutation,
  deleteMutation,
  onCreate,
  onCreateRefetch,
  onUpdate,
  onUpdateRefetch,
  onDelete,
  onDeleteRefetch,
  onClose,
}: EditModalMutationsOptions<
  TCreateData,
  TCreateArgs,
  TUpdateData,
  TUpdateArgs,
  TDeleteData,
  TDeleteArgs
>): EditModalMutations<
  TCreateData,
  TCreateArgs,
  TUpdateData,
  TUpdateArgs,
  TDeleteData,
  TDeleteArgs
> => {
  const createOptions = useMutationToast<TCreateData>({
    subject,
    action: "create",
    onCompleted: (data) => {
      if (onCreate) {
        onCreate(data);
      }
      onClose();
    },
  });
  const [create, { isLoading: isCreating }] = useMutation(createMutation, {
    ...createOptions,
    refetchQueries: onCreateRefetch,
  });

  const updateOptions = useMutationToast<TUpdateData>({
    subject,
    action: "update",
    onCompleted: (data) => {
      if (onUpdate) {
        onUpdate(data);
      }
      onClose();
    },
  });
  const [update, { isLoading: isUpdating }] = useMutation(updateMutation, {
    ...updateOptions,
    refetchQueries: onUpdateRefetch,
  });

  const deleteOptions = useMutationToast<TDeleteData>({
    subject,
    action: "delete",
    onCompleted: (data) => {
      if (onDelete) {
        onDelete(data);
      }
      onClose();
    },
  });
  const [_delete, { isLoading: isDeleting }] = useMutation(deleteMutation, {
    ...deleteOptions,
    refetchQueries: onDeleteRefetch,
  });

  return {
    create,
    update,
    delete: _delete,
    isCreating,
    isUpdating,
    isDeleting,
    isLoading: isCreating || isUpdating || isDeleting,
  };
};

export interface UseEditModalFormOptions<
  TFieldValues extends FieldValues,
  TContext extends object = object // eslint-disable-line @typescript-eslint/ban-types
> extends UseFormProps<TFieldValues, TContext> {
  key: string | undefined;
}

export const useEditModalForm = <
  TFieldValues extends FieldValues,
  TContext extends object = object // eslint-disable-line @typescript-eslint/ban-types
>({
  key,
  mode = "all",
  ...otherProps
}: UseEditModalFormOptions<
  TFieldValues,
  TContext
>): UseFormReturn<TFieldValues> => {
  const context = useForm({ mode, ...otherProps });
  const {
    watch,
    reset,
    trigger,
    formState: { isDirty, isValid, isValidating },
  } = context;

  // Reset form when key changes.
  useEffect(reset, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  // If default values update post-render, trigger validation.
  const values = watch();
  useEffect(
    () => {
      if (!isDirty && !isValid && !isValidating) {
        trigger();
      }
    },
    [values] /* eslint-disable-line react-hooks/exhaustive-deps */
  );

  return context;
};
