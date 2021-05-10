import React, { FC } from "react";

import { HiUser } from "react-icons/hi";

import { Container, VStack } from "@chakra-ui/react";
import { Heading, Text, Icon } from "@chakra-ui/react";
import { Table, Tbody, Tr, Td } from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/react";
import { Skeleton } from "@chakra-ui/react";

import { PageLayout } from "components";
import { useQuery } from "components";

const Directory: FC = () => {
  const {
    $state: { isLoading },
    users,
  } = useQuery();
  return (
    <PageLayout>
      <Container as={VStack} align="stretch" py={8}>
        <VStack align="stretch" spacing={0.5}>
          <Heading size="lg">Member Directory</Heading>
          <Text color="gray.500">
            This is a directory of all the members of UW Blueprint.
          </Text>
        </VStack>
        <Table>
          <Tbody>
            {users.map((user, index) => {
              const { id: userId, fullName, photoUrl } = user;
              const cellProps = { px: 2 };
              return (
                <Tr key={userId ?? index}>
                  <Td w={18} pl={4} {...cellProps}>
                    <Skeleton rounded="full" isLoaded={!isLoading}>
                      <Avatar
                        name={fullName}
                        icon={<Icon as={HiUser} fontSize="xl" />}
                        src={photoUrl ?? undefined}
                        bg="blue.100"
                        color="blue.500"
                      />
                    </Skeleton>
                  </Td>
                  <Td>
                    <VStack align="stretch" spacing={0}>
                      <Text fontSize="lg" fontWeight="medium">
                        {fullName}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        Unknown Role
                      </Text>
                    </VStack>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Container>
    </PageLayout>
  );
};

export default Directory;
