import React, { FC } from "react";

import { Container, VStack } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";

import { useViewerQuery, useSignIn, useSignOut } from "components";

const Home: FC = () => {
  const { viewer } = useViewerQuery();
  const signIn = useSignIn();
  const signOut = useSignOut();
  return (
    <Container as={VStack} py={8}>
      {viewer && (
        <Text>
          You are{" "}
          <Text as="span" fontWeight="semibold">
            {viewer.firstName} {viewer.lastName}
          </Text>
        </Text>
      )}
      <Button isFullWidth onClick={viewer ? signOut : signIn}>
        Sign {viewer ? "Out" : "In"}
      </Button>
    </Container>
  );
};

export default Home;
