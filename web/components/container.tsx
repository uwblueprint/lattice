import React, { FC, ReactNode } from "react";
import { HiPencil, HiMinusCircle } from "react-icons/hi";

import { BoxProps, Box, VStack, HStack } from "@chakra-ui/react";
import { Text, Icon } from "@chakra-ui/react";
import { IconButton, IconButtonProps } from "@chakra-ui/react";

export interface CardProps extends Omit<BoxProps, "title"> {
  title?: ReactNode;
  onClickEdit?: IconButtonProps["onClick"];
  onClickRemove?: IconButtonProps["onClick"];
}

export const Card: FC<CardProps> = ({
  title,
  onClickEdit,
  onClickRemove,
  children,
  ...otherProps
}) => {
  const showActions = [onClickEdit, onClickRemove].some((x) => !!x);
  const actionButtonProps = {
    variant: "ghost",
    size: "xs",
    fontSize: "lg",
    isRound: true,
    borderColor: "transparent",
    borderWidth: 1,
    transitionDuration: "150ms",
  };
  return (
    <VStack
      align="stretch"
      spacing={0}
      borderColor="blue.100"
      borderWidth={1}
      rounded="xl"
      {...otherProps}
    >
      <HStack
        spacing={2}
        bg="blue.50"
        roundedTop="xl"
        px={4}
        py={2.5}
        borderColor="blue.100"
        borderBottomWidth={1}
      >
        <Box flex={1}>
          {typeof title === "string" ? (
            <Text
              color="blue.600"
              fontSize="lg"
              fontWeight="semibold"
              noOfLines={1}
            >
              {title}
            </Text>
          ) : (
            title
          )}
        </Box>
        {showActions && (
          <HStack spacing={0.5}>
            {onClickEdit && (
              <IconButton
                icon={<Icon as={HiPencil} />}
                aria-label="Edit"
                colorScheme="blue"
                onClick={onClickEdit}
                _hover={{
                  borderColor: "blue.400",
                }}
                {...actionButtonProps}
              />
            )}
            {onClickRemove && (
              <IconButton
                icon={<Icon as={HiMinusCircle} />}
                aria-label="Remove"
                colorScheme="red"
                onClick={onClickRemove}
                _hover={{
                  borderColor: "red.400",
                }}
                {...actionButtonProps}
              />
            )}
          </HStack>
        )}
      </HStack>
      <Box px={4} py={3}>
        {children}
      </Box>
    </VStack>
  );
};
