import React, { FC, ReactNode } from "react";
import isEmpty from "lodash/isEmpty";

import { Box, Container, VStack } from "@chakra-ui/react";
import { Text, Heading } from "@chakra-ui/react";

import { Empty, PageLayout } from "components";
import { useViewerQuery } from "components";
import { UserCard } from "components";
import { MembershipCard, NewMembershipButton } from "components";
import { User } from "schema";

const Home: FC = () => {
  const {
    viewer,
    $state: { isLoading },
  } = useViewerQuery();

  const renderContent = (viewer: User): ReactNode => {
    const { id: viewerId, memberships } = viewer;
    return (
      <>
        <VStack align="stretch" spacing={0.5}>
          <Heading size="lg">Profile</Heading>
          <Text color="gray.500">
            Manage your public profile and your Blueprint membership.
          </Text>
        </VStack>
        <VStack align="stretch">
          <VStack align="stretch" spacing={0}>
            <Heading size="md">About</Heading>
            <Text color="gray.500">
              Who you are, and where people can find you!
            </Text>
          </VStack>
          <UserCard user={viewer} isLoading={isLoading} />
        </VStack>
        <VStack align="stretch">
          <VStack align="stretch" spacing={0}>
            <Heading size="md">Memberships</Heading>
            <Text color="gray.500">Your relationship with UW Blueprint.</Text>
          </VStack>
          {!isEmpty(memberships) ? (
            <VStack align="stretch">
              {memberships.map((membership, index) => {
                const { id: membershipId } = membership;
                return (
                  <MembershipCard
                    key={membershipId ?? index}
                    membership={membership}
                    onDeleteRefetch={[memberships]}
                  />
                );
              })}
            </VStack>
          ) : (
            <Empty>No memberships to show.</Empty>
          )}
          <NewMembershipButton
            userId={viewerId}
            onCreateRefetch={[memberships]}
          />
        </VStack>
      </>
    );
  };

  const renderMessage = (): ReactNode => {
    return (
      <Box bg="blue.100" rounded="md">
        <Text color="blue.600" p={4}>
          Sign in with your UW Blueprint account!
        </Text>
      </Box>
    );
  };

  return (
    <PageLayout>
      <Container as={VStack} align="stretch" spacing={6} py={8}>
        {viewer ? renderContent(viewer) : renderMessage()}
      </Container>
    </PageLayout>
  );
};

export default Home;
