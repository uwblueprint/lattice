import React, { FC } from "react";
import NoSSR from "react-no-ssr";
import NextLink from "next/link";
import { useRouter } from "next/router";

import { HiLogin, HiLogout } from "react-icons/hi";
import { HiUser } from "react-icons/hi";

import { Box, BoxProps, HStack, VStack, Spacer } from "@chakra-ui/react";
import { Text, Link, Icon } from "@chakra-ui/react";
import { ButtonProps } from "@chakra-ui/react";
import { Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/react";
import { Skeleton } from "@chakra-ui/react";

import { ExternalLink } from "components";
import { useViewerQuery } from "components";
import { useSignIn, useSignOut } from "components";
import { useTransparentize } from "components";

export type PageHeaderProps = BoxProps;

export const PageHeader: FC<PageHeaderProps> = ({ ...otherProps }) => {
  const signIn = useSignIn();
  const signOut = useSignOut();

  const {
    $state: { isLoading },
    viewer,
  } = useViewerQuery();
  const { fullName, photoUrl } = viewer ?? {};

  const avatarBg = useTransparentize("white", 0.9);
  return (
    <HStack h={20} px={8} bg="blue.600" {...otherProps}>
      <VStack align="stretch" spacing={0} color="white">
        <NextLink href="/">
          <Link
            fontSize="lg"
            fontWeight="black"
            letterSpacing={4}
            transitionProperty="opacity "
            transitionDuration="150ms"
            _hover={{ textDecor: "none" }}
          >
            LATTICE
          </Link>
        </NextLink>
        <ExternalLink
          href="https://uwblueprint.org"
          fontSize="xs"
          fontWeight="bold"
          letterSpacing={0.85}
          opacity={0.6}
          transitionProperty="opacity "
          transitionDuration="150ms"
          _hover={{ opacity: 0.8 }}
        >
          UW BLUEPRINT
        </ExternalLink>
      </VStack>
      <Spacer />
      <PageHeaderNavigation />
      <Spacer />
      <Menu>
        <MenuButton
          rounded="full"
          transitionDuration="150ms"
          borderWidth={3}
          borderColor="blue.500"
          _hover={{ opacity: 0.9 }}
        >
          <Skeleton rounded="full" isLoaded={!isLoading}>
            <Avatar
              src={photoUrl ?? undefined}
              name={fullName}
              icon={<Icon as={HiUser} fontSize="xl" />}
              boxSize={10}
              bg={avatarBg}
              color="blue.500"
            />
          </Skeleton>
        </MenuButton>
        <MenuList>
          <NoSSR>
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
          </NoSSR>
        </MenuList>
      </Menu>
    </HStack>
  );
};

type PageHeaderNavigationProps = BoxProps;

const PageHeaderNavigation: FC<PageHeaderNavigationProps> = ({
  ...otherProps
}) => {
  return (
    <HStack align="stretch" spacing={1} color="white" {...otherProps}>
      <PageHeaderNavigationItem path="/">Profile</PageHeaderNavigationItem>
      <PageHeaderNavigationItem path="/directory">
        Directory
      </PageHeaderNavigationItem>
      <PageHeaderNavigationItem path="/organization">
        Organization
      </PageHeaderNavigationItem>
    </HStack>
  );
};

interface PageHeaderNavigationItemProps extends ButtonProps {
  path: string;
}

const PageHeaderNavigationItem: FC<PageHeaderNavigationItemProps> = ({
  path: href,
  children,
  ...otherProps
}) => {
  const { pathname } = useRouter();
  const isActive = pathname === href;
  return (
    <NextLink href={href} passHref>
      <Link>
        <Button
          size="sm"
          colorScheme="blue"
          rounded="lg"
          bg={isActive ? "blue.700" : undefined}
          _hover={{ bg: "blue.700" }}
          {...otherProps}
        >
          <Text fontSize="md" fontWeight="medium">
            {children}
          </Text>
        </Button>
      </Link>
    </NextLink>
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
