import React, { FC, useMemo } from "react";
import { prepass } from "gqless";

import type { IconType } from "react-icons";
import { HiLink } from "react-icons/hi";
import { HiOutlineLink, HiOutlineMail, HiOutlinePhone } from "react-icons/hi";
import { FiTwitter, FiInstagram } from "react-icons/fi";

import { BoxProps, Box, VStack, HStack } from "@chakra-ui/react";
import { Image } from "@chakra-ui/react";
import { Text, Link, Icon, Heading } from "@chakra-ui/react";
import { FormLabel, FormControl } from "@chakra-ui/react";
import { SkeletonText } from "@chakra-ui/react";
import { ModalProps } from "@chakra-ui/react";

import {
  InputGroup,
  InputLeftElement,
  InputLeftAddon,
  Input,
} from "@chakra-ui/react";

import { Card, Section } from "components";
import { ExternalLink } from "components";
import { TextareaAutosize } from "components";
import { ModalTrigger } from "components";
import { EditModal, useEditModalForm } from "components";
import { useMutation, useMutationToast } from "components";
import { useTransparentize } from "components";

import { User } from "schema";
import { UpdateUserPayload, UpdateUserInput } from "schema";

export interface EditUserModalProps extends Omit<ModalProps, "children"> {
  user: User;
  onUpdate?: (payload: UpdateUserPayload) => void;
}

export const EditUserModal: FC<EditUserModalProps> = ({
  user,
  onUpdate,
  onClose,
  ...otherProps
}) => {
  const subject = "profile";
  const { id: userId, websiteUrl, twitterHandle, instagramHandle, bio } = user;

  const updateOptions = useMutationToast<UpdateUserPayload>({
    subject,
    action: "update",
    onCompleted: (data) => {
      if (onUpdate) {
        onUpdate(data);
      }
      onClose();
    },
  });
  const [update, { isLoading: isUpdating }] = useMutation(
    (mutation, args: UpdateUserInput) => {
      const payload = mutation.updateUser({ input: args });
      prepass(
        payload.user,
        "id",
        "websiteUrl",
        "twitterHandle",
        "instagramHandle",
        "bio"
      );
      return payload;
    },
    updateOptions
  );

  const { register, handleSubmit, formState } = useEditModalForm<{
    bio: string;
    websiteUrl: string;
    twitterHandle: string;
    instagramHandle: string;
  }>({ key: userId });
  const onSubmit = handleSubmit(async (values) => {
    if (userId) {
      await update({ args: { userId, ...values } });
    }
  });

  return (
    <EditModal
      subject={subject}
      mode="update"
      formState={formState}
      isUpdating={isUpdating}
      onClose={onClose}
      onSubmit={onSubmit}
      {...otherProps}
    >
      <FormControl>
        <FormLabel>Bio</FormLabel>
        <TextareaAutosize
          defaultValue={bio ?? ""}
          placeholder="I love to sing, dance, and play guitar!"
          minRows={4}
          maxRows={8}
          {...register("bio", {
            setValueAs: (value) => value || null,
          })}
        />
      </FormControl>
      <Section title="Socials">
        <FormControl>
          <FormLabel>Website URL</FormLabel>
          <InputGroup>
            <InputLeftElement>
              <Icon as={HiLink} fontSize="lg" color="blue.600" />
            </InputLeftElement>
            <Input
              defaultValue={websiteUrl ?? ""}
              placeholder="https://abhijeetprasad.com/"
              {...register("websiteUrl", {
                setValueAs: (value) => value || null,
              })}
            />
          </InputGroup>
        </FormControl>
        <FormControl>
          <FormLabel>Twitter Handle</FormLabel>
          <InputGroup>
            <InputLeftAddon paddingInline={3}>@</InputLeftAddon>
            <Input
              defaultValue={twitterHandle ?? ""}
              placeholder="abhiprasad"
              {...register("twitterHandle", {
                setValueAs: (value) => value || null,
              })}
            />
          </InputGroup>
        </FormControl>
        <FormControl>
          <FormLabel>Instagram Handle</FormLabel>
          <InputGroup>
            <InputLeftAddon paddingInline={3}>@</InputLeftAddon>
            <Input
              defaultValue={instagramHandle ?? ""}
              placeholder="abhiprasad"
              {...register("instagramHandle", {
                setValueAs: (value) => value || null,
              })}
            />
          </InputGroup>
        </FormControl>
      </Section>
    </EditModal>
  );
};

export interface UserCardProps
  extends BoxProps,
    Pick<EditUserModalProps, "onUpdate"> {
  user: User;
  isLoading?: boolean;
}

export const UserCard: FC<UserCardProps> = ({
  user,
  isLoading,
  onUpdate,
  ...otherProps
}) => {
  const {
    fullName,
    email,
    phone,
    photoUrl,
    websiteUrl,
    twitterHandle,
    instagramHandle,
    bio,
  } = user;

  const websiteDomain = useMemo(
    () => {
      if (!websiteUrl) {
        return null;
      }
      try {
        return new URL(websiteUrl).host;
      } catch (error) {
        return websiteUrl;
      }
    },
    [user] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const photoBorderColor = useTransparentize("blue.600", 0.3);
  return (
    <ModalTrigger
      renderModal={(disclosure) => (
        <EditUserModal user={user} onUpdate={onUpdate} {...disclosure} />
      )}
    >
      {({ open }) => (
        <Card
          title={
            <HStack>
              {photoUrl && (
                <Box
                  rounded="full"
                  borderWidth={2}
                  borderColor={photoBorderColor}
                >
                  <Image src={photoUrl} boxSize={10} rounded="full" />
                </Box>
              )}
              <Text fontSize="xl" noOfLines={1}>
                {fullName}
              </Text>
            </HStack>
          }
          onClickEdit={open}
          spacing={5}
          {...otherProps}
        >
          {!isLoading ? (
            <>
              <VStack align="stretch" spacing={1}>
                <Heading size="sm">Contact & Socials</Heading>
                <ContactLine icon={HiOutlineMail}>
                  <Link href={`mailto:${email}`}>{email}</Link>
                </ContactLine>
                {phone && (
                  <ContactLine icon={HiOutlinePhone}>
                    <Text>{phone}</Text>
                  </ContactLine>
                )}
                {websiteUrl && (
                  <ContactLine icon={HiOutlineLink}>
                    <ExternalLink href={websiteUrl}>
                      {websiteDomain}
                    </ExternalLink>
                  </ContactLine>
                )}
                {twitterHandle && (
                  <ContactLine icon={FiTwitter}>
                    <ExternalLink href={`https://twitter.com/${twitterHandle}`}>
                      @{twitterHandle}
                    </ExternalLink>
                  </ContactLine>
                )}
                {instagramHandle && (
                  <ContactLine icon={FiInstagram}>
                    <ExternalLink
                      href={`https://instagram.com/${instagramHandle}`}
                    >
                      @{instagramHandle}
                    </ExternalLink>
                  </ContactLine>
                )}
              </VStack>
              {bio && (
                <VStack align="stretch" spacing={0}>
                  <Heading size="sm">Bio</Heading>
                  <Text color="gray.600" noOfLines={8} whiteSpace="pre-line">
                    {bio}
                  </Text>
                </VStack>
              )}
            </>
          ) : (
            <SkeletonText noOfLines={4} />
          )}
        </Card>
      )}
    </ModalTrigger>
  );
};

interface ContactLineProps extends BoxProps {
  icon: IconType;
}

export const ContactLine: FC<ContactLineProps> = ({
  icon,
  children,
  ...otherProps
}) => {
  return (
    <HStack {...otherProps}>
      <Icon as={icon} fontSize="xl" color="blue.400" />
      <Box color="blue.600">{children}</Box>
    </HStack>
  );
};
