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
   * Implement the DateTime<Utc> scalar
   *
   * The input/output is a string in RFC3339 format.
   */
  DateTime: string;
}

export interface CreateMemberRoleInput {
  name: Scalars["String"];
  description: Scalars["String"];
}

export interface DeleteMemberRoleInput {
  roleId: Scalars["ID"];
}

export interface RegisterUserInput {
  firstName: Scalars["String"];
  lastName: Scalars["String"];
  phone?: Maybe<Scalars["String"]>;
  photoUrl?: Maybe<Scalars["String"]>;
}

export interface UpdateMemberRoleInput {
  roleId: Scalars["ID"];
  name: Scalars["String"];
  description: Scalars["String"];
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
    memberRoles: { __type: "[MemberRole!]!" },
    viewer: { __type: "User" },
    users: { __type: "[User!]!" },
    buildInfo: { __type: "BuildInfo!" },
  },
  mutation: {
    __typename: { __type: "String!" },
    createMemberRole: {
      __type: "CreateMemberRolePayload!",
      __args: { input: "CreateMemberRoleInput!" },
    },
    updateMemberRole: {
      __type: "UpdateMemberRolePayload!",
      __args: { input: "UpdateMemberRoleInput!" },
    },
    deleteMemberRole: {
      __type: "DeleteMemberRolePayload!",
      __args: { input: "DeleteMemberRoleInput!" },
    },
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
  CreateMemberRoleInput: {
    name: { __type: "String!" },
    description: { __type: "String!" },
  },
  CreateMemberRolePayload: {
    __typename: { __type: "String!" },
    role: { __type: "MemberRole!" },
  },
  DeleteMemberRoleInput: { roleId: { __type: "ID!" } },
  DeleteMemberRolePayload: {
    __typename: { __type: "String!" },
    roleId: { __type: "ID!" },
  },
  MemberRole: {
    __typename: { __type: "String!" },
    id: { __type: "ID!" },
    createdAt: { __type: "DateTime!" },
    updatedAt: { __type: "DateTime!" },
    name: { __type: "String!" },
    description: { __type: "String!" },
  },
  RegisterUserInput: {
    firstName: { __type: "String!" },
    lastName: { __type: "String!" },
    phone: { __type: "String" },
    photoUrl: { __type: "String" },
  },
  RegisterUserPayload: {
    __typename: { __type: "String!" },
    user: { __type: "User!" },
    isNewUser: { __type: "Boolean!" },
  },
  UpdateMemberRoleInput: {
    roleId: { __type: "ID!" },
    name: { __type: "String!" },
    description: { __type: "String!" },
  },
  UpdateMemberRolePayload: {
    __typename: { __type: "String!" },
    role: { __type: "MemberRole!" },
  },
  User: {
    __typename: { __type: "String!" },
    id: { __type: "ID!" },
    createdAt: { __type: "DateTime!" },
    updatedAt: { __type: "DateTime!" },
    firstName: { __type: "String!" },
    lastName: { __type: "String!" },
    fullName: { __type: "String!" },
    email: { __type: "String!" },
    phone: { __type: "String" },
    photoUrl: { __type: "String" },
  },
} as const;

export interface Query {
  __typename: "Query" | undefined;
  memberRoles: Array<MemberRole>;
  viewer?: Maybe<User>;
  users: Array<User>;
  buildInfo: BuildInfo;
}

export interface Mutation {
  __typename: "Mutation" | undefined;
  createMemberRole: (args: {
    input: CreateMemberRoleInput;
  }) => CreateMemberRolePayload;
  updateMemberRole: (args: {
    input: UpdateMemberRoleInput;
  }) => UpdateMemberRolePayload;
  deleteMemberRole: (args: {
    input: DeleteMemberRoleInput;
  }) => DeleteMemberRolePayload;
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

export interface CreateMemberRolePayload {
  __typename: "CreateMemberRolePayload" | undefined;
  role: MemberRole;
}

export interface DeleteMemberRolePayload {
  __typename: "DeleteMemberRolePayload" | undefined;
  roleId: ScalarsEnums["ID"];
}

export interface MemberRole {
  __typename: "MemberRole" | undefined;
  id: ScalarsEnums["ID"];
  createdAt: ScalarsEnums["DateTime"];
  updatedAt: ScalarsEnums["DateTime"];
  name: ScalarsEnums["String"];
  description: ScalarsEnums["String"];
}

export interface RegisterUserPayload {
  __typename: "RegisterUserPayload" | undefined;
  user: User;
  isNewUser: ScalarsEnums["Boolean"];
}

export interface UpdateMemberRolePayload {
  __typename: "UpdateMemberRolePayload" | undefined;
  role: MemberRole;
}

export interface User {
  __typename: "User" | undefined;
  id: ScalarsEnums["ID"];
  createdAt: ScalarsEnums["DateTime"];
  updatedAt: ScalarsEnums["DateTime"];
  firstName: ScalarsEnums["String"];
  lastName: ScalarsEnums["String"];
  fullName: ScalarsEnums["String"];
  email: ScalarsEnums["String"];
  phone?: Maybe<ScalarsEnums["String"]>;
  photoUrl?: Maybe<ScalarsEnums["String"]>;
}

export interface SchemaObjectTypes {
  Query: Query;
  Mutation: Mutation;
  Subscription: Subscription;
  BuildInfo: BuildInfo;
  CreateMemberRolePayload: CreateMemberRolePayload;
  DeleteMemberRolePayload: DeleteMemberRolePayload;
  MemberRole: MemberRole;
  RegisterUserPayload: RegisterUserPayload;
  UpdateMemberRolePayload: UpdateMemberRolePayload;
  User: User;
}
export type SchemaObjectTypesNames =
  | "Query"
  | "Mutation"
  | "Subscription"
  | "BuildInfo"
  | "CreateMemberRolePayload"
  | "DeleteMemberRolePayload"
  | "MemberRole"
  | "RegisterUserPayload"
  | "UpdateMemberRolePayload"
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
