import { useFirebaseSignIn, useFirebaseAuth } from "components";
import { useQuery, useRefetch, useMutation } from "components";
import { useNotify } from "components";

import { GQlessClient } from "components";
import { prepass } from "gqless";

import { RegisterUserInput } from "schema";

export const useSignIn = (): (() => void) => {
  const notify = useNotify();
  const query = useQuery();
  const refetch = useRefetch();

  const [registerUser] = useMutation(
    (mutation, args: RegisterUserInput) => {
      const payload = mutation.registerUser({
        input: args,
      });
      return prepass(
        payload,
        ["user", "id", "firstName", "lastName"],
        "isNewUser"
      );
    },
    {
      onCompleted: ({ user, isNewUser }) => {
        const { id: userId, firstName, lastName } = user;
        const name = `${firstName} ${lastName}`;
        console.info(
          `[components/authentication] signed in as ${name} (${userId})`
        );
        if (isNewUser) {
          refetch(() => query.viewer?.id);
        }
      },
      onError: (error) => {
        notify({
          status: "error",
          title: "Sign-in failed!",
          description: error.message,
        });
      },
    }
  );
  return useFirebaseSignIn(({ user }) => {
    const { displayName } = user;
    if (!displayName) {
      console.error(`[components/authentication] missing display name`);
    }
    const [firstName, lastName] = displayName?.split(" ") || [];
    registerUser({
      args: {
        firstName: firstName || "(Unknown)",
        lastName: lastName || "",
      },
    });
  });
};

export const useSignOut = (): (() => void) => {
  const auth = useFirebaseAuth();
  return () => {
    if (auth) {
      auth.signOut();
    }
  };
};
