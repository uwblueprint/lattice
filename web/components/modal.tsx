import React, { FC, ReactNode } from "react";

import { useDisclosure, UseDisclosureReturn } from "@chakra-ui/react";

export interface ModalTriggerProps {
  renderModal: (disclosure: UseDisclosureReturn) => ReactNode;
  children: (open: UseDisclosureReturn["onOpen"]) => ReactNode;
}

export const ModalTrigger: FC<ModalTriggerProps> = ({
  renderModal,
  children,
}) => {
  const disclosure = useDisclosure();
  return (
    <>
      {children(disclosure.onOpen)}
      {renderModal(disclosure)}
    </>
  );
};
