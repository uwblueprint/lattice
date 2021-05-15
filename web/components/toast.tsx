import { useToast as _useToast } from "@chakra-ui/react";
import { UseToastOptions as _UseToastOptions } from "@chakra-ui/react";

import type { GQlessError } from "gqless";
import { capitalize } from "voca";

export type UseToastOptions = _UseToastOptions;
export const useToast = (
  options?: UseToastOptions
): ReturnType<typeof _useToast> => {
  return _useToast({
    position: "bottom",
    duration: 3000,
    isClosable: true,
    ...options,
  });
};

export type MutationToastAction = "create" | "update" | "delete";

export interface MutationToastOptions<TData> {
  subject: string;
  action: MutationToastAction;
  onCompleted?: (data: TData) => void;
  onError?: (error: GQlessError) => void;
}

export interface MutationToastCallbacks<TData> {
  onCompleted: (data: TData) => void;
  onError: (error: GQlessError) => void;
}

const mutationToastActionPastTense = (action: MutationToastAction): string => {
  return action + "d";
};

export const useMutationToast = <TData,>({
  subject,
  action,
  onCompleted,
  onError,
}: MutationToastOptions<TData>): MutationToastCallbacks<TData> => {
  const toast = useToast();
  return {
    onCompleted: (data) => {
      if (onCompleted) {
        onCompleted(data);
      }
      const actionPastTense = mutationToastActionPastTense(action);
      toast({
        status: "success",
        description: `${capitalize(subject)} ${actionPastTense}`,
      });
    },
    onError: (error) => {
      if (onError) {
        onError(error);
      }
      toast({
        status: "error",
        title: `Failed to ${action} ${subject}`,
        description: error.message,
      });
    },
  };
};
