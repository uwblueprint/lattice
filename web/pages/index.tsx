import React, { FC } from "react";

import { Container, VStack } from "@chakra-ui/react";

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
        {viewer && <UserCard user={viewer} isLoading={isLoading} />}
      </Container>
    </PageLayout>
  );
};

export default Home;
