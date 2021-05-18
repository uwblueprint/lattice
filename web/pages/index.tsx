import React, { FC, useEffect } from "react";

import { Box, Container, VStack } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";

import { PageLayout } from "components";
import { useViewerQuery } from "components";
import { UserCard } from "components";

const Home: FC = () => {
  const {
    viewer,
    $state: { isLoading },
  } = useViewerQuery();
  return (
    <PageLayout>
      <Container as={VStack} align="stretch" py={8}>
        {viewer ? (
          <UserCard user={viewer} isLoading={isLoading} />
        ) : (
          <Box bg="blue.100" rounded="md">
            <Text color="blue.600" p={4}>
              Sign in with your UW Blueprint account!
            </Text>
          </Box>
        )}
      </Container>
    </PageLayout>
  );
};

export default Home;
