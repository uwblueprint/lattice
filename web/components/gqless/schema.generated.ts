/**
 * GQLESS AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
 */

import { ScalarsEnumsHash } from "gqless";

export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /**
   * Implement the DateTime<FixedOffset> scalar
   *
   * The input/output is a string in RFC3339 format.
   */
  DateTime: string;
}

export interface RegisterUserInput {
  firstName: Scalars["String"];
  lastName: Scalars["String"];
}

export const scalarsEnumsHash: ScalarsEnumsHash = {
  Boolean: true,
  DateTime: true,
  Float: true,
  ID: true,
  Int: true,
  String: true,
};
export const generatedSchema = {
  query: {
    __typename: { __type: "String!" },
    viewer: { __type: "User" },
    buildInfo: { __type: "BuildInfo!" },
  },
  mutation: {
    __typename: { __type: "String!" },
    registerUser: {
      __type: "RegisterUserPayload!",
      __args: { input: "RegisterUserInput!" },
    },
  },
  subscription: {},
  BuildInfo: {
    __typename: { __type: "String!" },
    timestamp: { __type: "DateTime!" },
    version: { __type: "String" },
  },
  RegisterUserInput: {
    firstName: { __type: "String!" },
    lastName: { __type: "String!" },
  },
  RegisterUserPayload: {
    __typename: { __type: "String!" },
    user: { __type: "User!" },
    isNewUser: { __type: "Boolean!" },
  },
  User: {
    __typename: { __type: "String!" },
    id: { __type: "ID!" },
    email: { __type: "String!" },
    firstName: { __type: "String!" },
    lastName: { __type: "String!" },
  },
} as const;

export interface Query {
  __typename: "Query" | undefined;
  viewer?: Maybe<User>;
  buildInfo: BuildInfo;
}

export interface Mutation {
  __typename: "Mutation" | undefined;
  registerUser: (args: { input: RegisterUserInput }) => RegisterUserPayload;
}

export interface Subscription {
  __typename: "Subscription" | undefined;
}

export interface BuildInfo {
  __typename: "BuildInfo" | undefined;
  timestamp: ScalarsEnums["DateTime"];
  version?: Maybe<ScalarsEnums["String"]>;
}

export interface RegisterUserPayload {
  __typename: "RegisterUserPayload" | undefined;
  user: User;
  isNewUser: ScalarsEnums["Boolean"];
}

export interface User {
  __typename: "User" | undefined;
  id: ScalarsEnums["ID"];
  email: ScalarsEnums["String"];
  firstName: ScalarsEnums["String"];
  lastName: ScalarsEnums["String"];
}

export interface SchemaObjectTypes {
  Query: Query;
  Mutation: Mutation;
  Subscription: Subscription;
  BuildInfo: BuildInfo;
  RegisterUserPayload: RegisterUserPayload;
  User: User;
}
export type SchemaObjectTypesNames =
  | "Query"
  | "Mutation"
  | "Subscription"
  | "BuildInfo"
  | "RegisterUserPayload"
  | "User";

export interface GeneratedSchema {
  query: Query;
  mutation: Mutation;
  subscription: Subscription;
}

export type MakeNullable<T> = {
  [K in keyof T]: T[K] | undefined;
};

export interface ScalarsEnums extends MakeNullable<Scalars> {}
