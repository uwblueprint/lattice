import React, { FC, ReactNode } from "react";
import { HiPencil, HiMinusCircle } from "react-icons/hi";

import { StackProps, Box, VStack, HStack } from "@chakra-ui/react";
import { Text, Icon } from "@chakra-ui/react";
import { IconButton, IconButtonProps } from "@chakra-ui/react";

export interface CardProps extends Omit<StackProps, "title"> {
  title?: ReactNode;
  onClickEdit?: IconButtonProps["onClick"];
  onClickRemove?: IconButtonProps["onClick"];
}

export const Card: FC<CardProps> = ({
  title,
  onClickEdit,
  onClickRemove,
  align,
  alignItems,
  justify,
  justifyContent,
  spacing = 3,
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
        <Box flex={1} color="blue.600" fontSize="lg" fontWeight="semibold">
          {typeof title === "string" ? (
            <Text noOfLines={1}>{title}</Text>
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
      <VStack
        px={4}
        py={3}
        {...{ align, alignItems, justify, justifyContent, spacing }}
      >
        {children}
      </VStack>
    </VStack>
  );
};

export interface SectionProps extends Omit<StackProps, "title"> {
  title?: ReactNode;
}

export const Section: FC<SectionProps> = ({
  title,
  align,
  alignItems,
  justify,
  justifyContent,
  spacing = 3,
  padding,
  p = 3,
  px,
  py,
  pl,
  pr,
  pt,
  pb,
  children,
  ...otherProps
}) => {
  return (
    <VStack
      align="stretch"
      spacing={0}
      borderColor="blue.100"
      borderWidth={1}
      rounded="xl"
      {...otherProps}
    >
      <Box
        bg="blue.50"
        roundedTop="xl"
        px={4}
        py={2.5}
        borderColor="blue.100"
        borderBottomWidth={1}
        color="blue.600"
        fontSize="lg"
        fontWeight="semibold"
      >
        {typeof title === "string" ? <Text noOfLines={1}>{title}</Text> : title}
      </Box>
      <VStack
        {...{ padding, p, px, py, pl, pr, pt, pb }}
        {...{ align, alignItems, justify, justifyContent, spacing }}
      >
        {children}
      </VStack>
    </VStack>
  );
};
