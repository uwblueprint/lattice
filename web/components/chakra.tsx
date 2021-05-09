import React, { FC } from "react";

import { ChakraProvider as Provider } from "@chakra-ui/react";
import { Theme, extendTheme } from "@chakra-ui/react";

const Fonts =
  "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, " +
  "'Helvetica Neue', Arial, 'Noto Sans', sans-serif";

export const ChakraTheme: Theme = extendTheme({
  fonts: {
    body: Fonts,
    heading: Fonts,
  },
  space: {
    0.5: "0.125rem",
    1.5: "0.375rem",
    2.5: "0.625rem",
    3.5: "0.875rem",
  },
  sizes: {
    0.5: "0.125rem",
    1.5: "0.375rem",
    2.5: "0.625rem",
    3.5: "0.875rem",
  },
  styles: {
    global: {
      html: {
        WebkitFontSmoothing: "auto",
      },
      body: {
        lineHeight: "normal",
      },
    },
  },
});

export const ChakraProvider: FC = ({ children }) => (
  <Provider theme={ChakraTheme}>{children}</Provider>
);
