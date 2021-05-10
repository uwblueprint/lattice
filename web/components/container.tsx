import React, { FC, ReactNode } from "react";
import isEmpty from "lodash/isEmpty";

import { HiPencil, HiX } from "react-icons/hi";

import { BoxProps, Box, VStack, HStack } from "@chakra-ui/react";
import { Text, Icon } from "@chakra-ui/react";
import { IconButton, IconButtonProps } from "@chakra-ui/react";

export type CardActions = "edit" | "remove";

export interface CardProps extends Omit<BoxProps, "title"> {
  title?: ReactNode;
  actions?: CardActions[];
  onClickEdit?: IconButtonProps["onClick"];
  onClickRemove?: IconButtonProps["onClick"];
}

export const Card: FC<CardProps> = ({
  title,
  actions = [],
  onClickEdit,
  onClickRemove,
  children,
  ...otherProps
}) => {
  const getActionProps = (action: CardActions): IconButtonProps => {
    switch (action) {
      case "edit":
        return {
          icon: <Icon as={HiPencil} />,
          "aria-label": "Edit",
          colorScheme: "blue",
          onClick: onClickEdit,
          _hover: {
            borderColor: "blue.400",
          },
        };
      case "remove":
        return {
          icon: <Icon as={HiX} />,
          "aria-label": "Remove",
          colorScheme: "red",
          onClick: onClickRemove,
          _hover: {
            borderColor: "red.400",
          },
        };
    }
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
        {!isEmpty(actions) && (
          <HStack spacing={0.5}>
            {actions.map((action) => (
              <IconButton
                key={action}
                variant="ghost"
                size="xs"
                fontSize="lg"
                isRound
                borderColor="transparent"
                borderWidth={1}
                transitionDuration="150ms"
                {...getActionProps(action)}
              />
            ))}
          </HStack>
        )}
      </HStack>
      <Box px={4} py={3}>
        {children}
      </Box>
    </VStack>
  );
};
