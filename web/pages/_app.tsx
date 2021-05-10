import React, { FC } from "react";
import Head from "next/head";
import type { AppProps } from "next/app";

import { ChakraProvider } from "components";
import { FirebaseProvider } from "components";

const App: FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>Lattice | UW Blueprint</title>
      </Head>
      <ChakraProvider>
        <FirebaseProvider>
          <Component {...pageProps} />
        </FirebaseProvider>
      </ChakraProvider>
    </>
  );
};

export default App;
