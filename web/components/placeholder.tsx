import React, { FC } from "react";

import { Box, BoxProps } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";

export type EmptyProps = BoxProps;

export const Empty: FC<EmptyProps> = ({ children, ...otherProps }) => (
  <Box bg="gray.100" color="gray.500" p={5} rounded="md" {...otherProps}>
    {typeof children === "string" ? <Text>{children}</Text> : children}
  </Box>
);
