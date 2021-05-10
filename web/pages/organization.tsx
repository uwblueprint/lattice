import React, { FC } from "react";
import isEmpty from "lodash/isEmpty";

import { Container, VStack } from "@chakra-ui/react";
import { Heading, Text } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";

import { PageLayout, Empty, ModalTrigger, MemberRoleCard } from "components";
import { EditMemberRoleModal } from "components";
import { useQuery, useRefetch } from "components";

const Organization: FC = () => {
  const { memberRoles } = useQuery();
  const refetch = useRefetch();

  return (
    <PageLayout>
      <Container as={VStack} align="stretch" spacing={6} py={8}>
        <VStack align="stretch" spacing={0.5}>
          <Heading size="lg">Organization Management</Heading>
          <Text color="gray.500">
            Manage organization member roles, policies, and processes.
          </Text>
        </VStack>
        <VStack align="stretch">
          <VStack align="stretch" spacing={0}>
            <Heading size="md">Member Roles</Heading>
            <Text color="gray.500">
              These are the roles and responsibilities within UW Blueprint.
            </Text>
          </VStack>
          {!isEmpty(memberRoles) ? (
            <VStack align="stretch" spacing={3}>
              {memberRoles.map((role, index) => {
                const { id: roleId } = role;
                return (
                  <MemberRoleCard
                    key={roleId ?? index}
                    role={role}
                    onDelete={() => {
                      refetch();
                    }}
                  />
                );
              })}
            </VStack>
          ) : (
            <Empty>No member roles.</Empty>
          )}
          <ModalTrigger
            renderModal={(disclosure) => (
              <EditMemberRoleModal
                onCreate={() => {
                  refetch();
                }}
                {...disclosure}
              />
            )}
          >
            {(open) => (
              <Button colorScheme="blue" alignSelf="start" onClick={open}>
                Add Role
              </Button>
            )}
          </ModalTrigger>
        </VStack>
      </Container>
    </PageLayout>
  );
};

export default Organization;
