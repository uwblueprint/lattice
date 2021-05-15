import React, {
  FC,
  createContext,
  useMemo,
  useContext,
  useEffect,
  useState,
} from "react";

import { FirebaseApp as App } from "firebase/app";
import { initializeApp, getApp } from "firebase/app";

import { initializeAuth, getAuth, Auth } from "firebase/auth";
import { User, UserCredential } from "firebase/auth";

import { browserLocalPersistence } from "firebase/auth";
import { browserPopupRedirectResolver } from "firebase/auth";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

import { useToast } from "components";

export type FirebaseApp = App;
export type FirebaseAuth = Auth;
export type FirebaseUser = User;

export type FirebaseContext = {
  app: App;
  auth: Auth;
};

export const FirebaseContext = createContext<FirebaseContext | undefined>(
  undefined
);

export const FirebaseProvider: FC = ({ children }) => {
  const value = useMemo<FirebaseContext>(() => {
    try {
      const app = getApp();
      const auth = getAuth(app);
      return { app, auth };
    } catch (error) {
      if (error.code !== "app/no-app") {
        throw new Error(error);
      }
      const app = initializeApp({
        apiKey: "AIzaSyB5ZZC4YdoiH2Iqei1d6NTrn4g3TaSes7Y",
        authDomain: "lattice-c51fc.firebaseapp.com",
        projectId: "lattice-c51fc",
        storageBucket: "lattice-c51fc.appspot.com",
        messagingSenderId: "65249856147",
        appId: "1:65249856147:web:77f3f42d00227494dd9b66",
        measurementId: "G-203Y1K6HGN",
      });
      const auth = initializeAuth(app, {
        persistence: browserLocalPersistence,
        popupRedirectResolver: browserPopupRedirectResolver,
      });
      return { app, auth };
    }
  }, []);
  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};

const useFirebase = (): FirebaseContext => {
  const value = useContext(FirebaseContext);
  if (!value) {
    throw new Error("Missing Firebase provider.");
  }
  return value;
};

export const useFirebaseApp = (): FirebaseApp => {
  return useFirebase().app;
};

export const useFirebaseAuth = (): FirebaseAuth => {
  return useFirebase().auth;
};

export const useFirebaseUser = (): FirebaseUser | null => {
  const auth = useFirebaseAuth();
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  useEffect(() => {
    return auth.onAuthStateChanged((user) => {
      if (user && currentUser && user.uid === currentUser.uid) {
        return;
      }
      if (!user && !currentUser) {
        return;
      }
      setCurrentUser(user);
    });
  }, [auth, currentUser]);
  return currentUser;
};

export const useFirebaseToken = (): string | null => {
  const auth = useFirebaseAuth();
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  useEffect(() => {
    return auth.onIdTokenChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setCurrentToken(token);
      } else {
        setCurrentToken(null);
      }
    });
  }, [/* eslint-disable-line react-hooks/exhaustive-deps */ auth]);
  return currentToken;
};

export const useFirebaseSignIn = (
  callback: (credential: UserCredential) => void
): (() => void) => {
  const toast = useToast();
  const auth = useFirebaseAuth();
  const provider = useMemo(() => new GoogleAuthProvider(), []);
  return async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      callback(result);
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        return;
      }
      console.error("[components/firebase] sign-in failed", { error });
      toast({
        status: "error",
        title: "Sign-in failed",
        description: error.message,
      });
    }
  };
};
