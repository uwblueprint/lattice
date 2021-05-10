import React, { FC } from "react";

import { Box, BoxProps } from "@chakra-ui/react";

export type CardProps = BoxProps;

export const Card: FC<CardProps> = ({ children, ...otherProps }) => {
  return (
    <Box
      p={4}
      borderWidth={2}
      borderColor="gray.100"
      rounded="xl"
      {...otherProps}
    >
      {children}
    </Box>
  );
};
