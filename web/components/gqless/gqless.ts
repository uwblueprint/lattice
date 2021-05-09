import { useEffect } from "react";
import getConfig from "next/config";

import { createReactClient, UseQuery } from "@gqless/react";
import { createClient, QueryFetcher } from "gqless";

import { scalarsEnumsHash } from "./schema.generated";
import { generatedSchema, GeneratedSchema } from "./schema.generated";
import { SchemaObjectTypes, SchemaObjectTypesNames } from "./schema.generated";

import { getAuth as getFirebaseAuth } from "firebase/auth";
import { Auth as FirebaseAuth } from "firebase/auth";
import { useFirebaseToken } from "components/firebase";

const getFirebaseAuthIfInitialized = (): FirebaseAuth | undefined => {
  try {
    return getFirebaseAuth();
  } catch (error) {
    throw new Error(`Failed get Firebase Auth module: ${error}`);
  }
};

const apiUrl: string | undefined = getConfig().serverRuntimeConfig?.apiUrl;

let queryEndpoint: string | undefined;
const getQueryEndpoint = (): string => {
  if (!queryEndpoint) {
    if (typeof window !== "undefined") {
      const { protocol, host } = location;
      queryEndpoint = `${protocol}//${host}/api/graphql`;
    } else if (apiUrl) {
      queryEndpoint = `${apiUrl}/graphql`;
    } else {
      throw new Error("Unable to determine GraphQL endpoint.");
    }
  }
  return queryEndpoint;
};

const queryFetcher: QueryFetcher = async function (query, variables) {
  const auth = getFirebaseAuthIfInitialized();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (auth?.currentUser) {
    const token = await auth.currentUser.getIdToken();
    headers["Authorization"] = `Bearer ${token}`;
  }

  const endpoint = getQueryEndpoint();
  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query,
      variables,
    }),
    mode: "cors",
  });
  return response.json();
};

export const GQlessClient = createClient<
  GeneratedSchema,
  SchemaObjectTypesNames,
  SchemaObjectTypes
>({
  schema: generatedSchema,
  scalarsEnumsHash,
  queryFetcher,
});

export const {
  query,
  mutation,
  mutate,
  subscription,
  resolved,
  refetch,
} = GQlessClient;

export const {
  graphql,
  useQuery,
  usePaginatedQuery,
  useTransactionQuery,
  useLazyQuery,
  useRefetch,
  useMutation,
  useMetaState,
  prepareReactRender,
  useHydrateCache,
  prepareQuery,
} = createReactClient<GeneratedSchema>(GQlessClient, {
  defaults: {
    // Set this flag as "true" if your usage involves React Suspense
    // Keep in mind that you can overwrite it in a per-hook basis
    suspense: false,

    // Set this flag based on your needs
    staleWhileRevalidate: false,
  },
});

export const useViewerQuery: UseQuery<GeneratedSchema> = (options) => {
  const refetch = useRefetch();
  const query = useQuery(options);
  const token = useFirebaseToken();
  useEffect(
    () => {
      const { viewer } = query;
      if (viewer) {
        refetch(viewer);
      } else {
        refetch();
      }
    },
    [token] /* eslint-disable-line react-hooks/exhaustive-deps */
  );
  return query;
};
