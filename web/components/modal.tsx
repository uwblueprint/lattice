import React, { FC, ReactNode } from "react";

import { useDisclosure, UseDisclosureReturn } from "@chakra-ui/react";

export interface ModalTriggerChildrenProps {
  open: UseDisclosureReturn["onOpen"];
  isOpen: boolean;
}

export interface ModalTriggerProps {
  renderModal: (disclosure: UseDisclosureReturn) => ReactNode;
  children: (props: ModalTriggerChildrenProps) => ReactNode;
}

export const ModalTrigger: FC<ModalTriggerProps> = ({
  renderModal,
  children,
}) => {
  const disclosure = useDisclosure();
  const { isOpen, onOpen: open } = disclosure;
  return (
    <>
      {children({ open, isOpen })}
      {renderModal(disclosure)}
    </>
  );
};
