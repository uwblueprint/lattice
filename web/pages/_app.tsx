import React, { FC } from "react";
import type { AppProps } from "next/app";

import { ChakraProvider } from "components";
import { FirebaseProvider } from "components";

const App: FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <ChakraProvider>
      <FirebaseProvider>
        <Component {...pageProps} />
      </FirebaseProvider>
    </ChakraProvider>
  );
};

export default App;
