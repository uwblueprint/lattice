import React, { forwardRef } from "react";
import { Textarea, TextareaProps as _TextareaProps } from "@chakra-ui/react";

import _TextareaAutosize from "react-textarea-autosize";
import { TextareaAutosizeProps as _TextareaAutosizeProps } from "react-textarea-autosize";

export interface TextareaAutosizeProps
  extends Omit<_TextareaProps, "rows">,
    Pick<
      _TextareaAutosizeProps,
      "minRows" | "maxRows" | "onHeightChange" | "cacheMeasurements"
    > {}

export const TextareaAutosize = forwardRef<
  HTMLTextAreaElement,
  TextareaAutosizeProps
>((props, ref) => (
  <Textarea as={_TextareaAutosize} ref={ref} rows={1} {...props} />
));

TextareaAutosize.displayName = "TextareaAutosize";
