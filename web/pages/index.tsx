import React, { FC, useMemo } from "react";
import { selectFields } from "gqless";

import { Box, Container, VStack } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";

import { PageLayout } from "components";
import { useViewerQuery } from "components";

const Home: FC = () => {
  const { viewer } = useViewerQuery();
  const viewerFields = useMemo(() => {
    return selectFields(viewer, [
      "id",
      "createdAt",
      "updatedAt",
      "firstName",
      "lastName",
      "email",
      "phone",
      "photoUrl",
    ]);
  }, [viewer]);
  return (
    <PageLayout>
      <Container as={VStack} align="stretch" py={8}>
        <Box bg="blue.50" color="blue.600" p={2} rounded="md">
          {viewer?.id ? (
            <Text as="pre" fontSize="sm" whiteSpace="pre-wrap">
              {JSON.stringify(viewerFields, undefined, 2)}
            </Text>
          ) : (
            <Text>Sign in with your UW Blueprint account.</Text>
          )}
        </Box>
      </Container>
    </PageLayout>
  );
};

export default Home;
