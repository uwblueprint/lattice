import { prepass } from "gqless";
import { RegisterUserInput } from "schema";

import { useFirebaseSignIn, useFirebaseAuth } from "components";
import { useQuery, useRefetch, useMutation } from "components";
import { useToast } from "components";

export const useSignIn = (): (() => void) => {
  const toast = useToast();
  const query = useQuery();
  const refetch = useRefetch();

  const [registerUser] = useMutation(
    (mutation, args: RegisterUserInput) => {
      const payload = mutation.registerUser({
        input: args,
      });
      prepass(payload, "isNewUser");
      prepass(
        payload.user,
        "id",
        "firstName",
        "lastName",
        "fullName",
        "email",
        "phone",
        "photoUrl"
      );
      return payload;
    },
    {
      onCompleted: ({ user, isNewUser }) => {
        const { id: userId, fullName } = user;
        console.info(
          `[components/authentication] signed in as ${fullName} (${userId})`
        );
        if (isNewUser) {
          refetch(() => query.viewer?.id);
        }
      },
      onError: ({ message }) => {
        toast({
          status: "error",
          title: "Sign-in failed!",
          description: message,
        });
      },
    }
  );
  return useFirebaseSignIn(({ user }) => {
    const { displayName, phoneNumber, photoURL } = user;
    if (!displayName) {
      console.error(`[components/authentication] missing display name`);
    }
    const [firstName, lastName] = displayName?.split(" ") || [];
    registerUser({
      args: {
        firstName: firstName || "(Unknown)",
        lastName: lastName || "",
        phone: phoneNumber,
        photoUrl: photoURL,
      },
    });
  });
};

export const useSignOut = (): (() => void) => {
  const auth = useFirebaseAuth();
  return () => {
    if (auth) {
      auth.signOut();
      console.info(`[components/authentication] signed out`);
    }
  };
};
