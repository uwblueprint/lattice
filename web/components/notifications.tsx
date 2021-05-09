import { useToast, UseToastOptions } from "@chakra-ui/react";

export type UseNotifyOptions = UseToastOptions;
export const useNotify = (
  options?: UseToastOptions
): ReturnType<typeof useToast> => {
  return useToast({
    position: "bottom",
    duration: 3000,
    isClosable: true,
    ...options,
  });
};
