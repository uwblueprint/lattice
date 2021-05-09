import { prepass } from "gqless";

import { useFirebaseSignIn } from "components";
import { useMutation } from "components";
import { useNotify } from "components";

import { RegisterUserInput } from "schema";
import { useFirebaseAuth } from "./firebase";

export const useSignIn = (): (() => void) => {
  const notify = useNotify();
  const [registerUser] = useMutation(
    (mutation, args: RegisterUserInput) => {
      const payload = mutation.registerUser({
        input: args,
      });
      prepass(payload, "user.id");
    },
    {
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
