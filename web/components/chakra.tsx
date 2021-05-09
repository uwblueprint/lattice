import React, { FC } from "react";
import {
  coolGray,
  yellow,
  emerald,
  teal,
  blue,
  indigo,
  violet,
  pink,
  rose,
} from "tailwindcss/colors";

import { ChakraProvider as Provider } from "@chakra-ui/react";
import { Theme, useTheme, extendTheme } from "@chakra-ui/react";
import { transparentize } from "@chakra-ui/theme-tools";

const Fonts =
  "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, " +
  "'Helvetica Neue', Arial, 'Noto Sans', sans-serif";

export const ChakraTheme: Theme = extendTheme({
  colors: {
    gray: coolGray,
    red: rose,
    yellow,
    green: emerald,
    teal,
    blue,
    indigo,
    purple: violet,
    pink,
  },
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

export const useTransparentize = (color: string, opacity: number): string => {
  const theme = useTheme();
  return transparentize(color, opacity)(theme);
};
