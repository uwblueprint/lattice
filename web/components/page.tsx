import React, { FC } from "react";

import { HiLogin, HiLogout } from "react-icons/hi";
import { HiUser } from "react-icons/hi";

import { Box, BoxProps, HStack, VStack, Spacer } from "@chakra-ui/react";
import { Text, Icon } from "@chakra-ui/react";
import { Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/react";
import { Skeleton } from "@chakra-ui/react";

import { ExternalLink } from "components";
import { useQuery } from "components";
import { useSignIn, useSignOut } from "components";
import { useTransparentize } from "components";

export type PageHeaderProps = BoxProps;

export const PageHeader: FC<PageHeaderProps> = ({ ...otherProps }) => {
  const {
    viewer,
    $state: { isLoading },
  } = useQuery();
  const { fullName, photoUrl } = viewer ?? {};

  const signIn = useSignIn();
  const signOut = useSignOut();

  const avatarBg = useTransparentize("white", 0.9);
  return (
    <HStack h={20} px={8} bg="blue.600" {...otherProps}>
      <VStack align="stretch" spacing={0} color="white">
        <Text fontSize="lg" fontWeight="black" letterSpacing={4}>
          LATTICE
        </Text>
        <ExternalLink
          href="https://uwblueprint.org"
          fontSize="xs"
          fontWeight="bold"
          letterSpacing={0.85}
          opacity={0.6}
          transitionProperty="opacity "
          transitionDuration="200ms"
          _hover={{ opacity: 0.8, textDecor: "underline" }}
        >
          UW BLUEPRINT
        </ExternalLink>
      </VStack>
      <Spacer />
      <Menu>
        <MenuButton
          rounded="full"
          transitionDuration="200ms"
          borderWidth={3}
          borderColor="blue.500"
          _hover={{ opacity: 0.9 }}
        >
          <Skeleton rounded="full" isLoaded={!isLoading}>
            <Avatar
              src={photoUrl ?? undefined}
              name={fullName}
              icon={<Icon as={HiUser} fontSize="xl" color="blue.600" />}
              boxSize={10}
              bg={avatarBg}
            />
          </Skeleton>
        </MenuButton>
        <MenuList>
          <MenuItem
            icon={
              <Icon
                as={viewer ? HiLogout : HiLogin}
                fontSize="lg"
                color="blue.600"
              />
            }
            onClick={viewer ? signOut : signIn}
          >
            Sign {viewer ? "Out" : "In"}
          </MenuItem>
        </MenuList>
      </Menu>
    </HStack>
  );
};

export type PageLayoutProps = BoxProps;

export const PageLayout: FC<PageLayoutProps> = ({
  children,
  ...otherProps
}) => {
  return (
    <Box minH="100vh" {...otherProps}>
      <PageHeader />
      {children}
    </Box>
  );
};
