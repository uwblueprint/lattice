import React, { FC } from "react";
import { useDebouncedCallback } from "use-debounce";

import { HiSearch } from "react-icons/hi";

import { BoxProps } from "@chakra-ui/react";
import { Icon, Fade, Spinner } from "@chakra-ui/react";

import {
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
} from "@chakra-ui/react";

export interface SearchBarProps extends BoxProps {
  isLoading?: boolean;
  delay?: number;
  onUpdate: (query: string) => void;
}

export const SearchBar: FC<SearchBarProps> = ({
  placeholder = "Search",
  delay = 250,
  isLoading,
  onChange,
  onUpdate,
  ...otherProps
}) => {
  const update = useDebouncedCallback(onUpdate, delay);
  return (
    <InputGroup {...otherProps}>
      <InputLeftElement>
        <Icon as={HiSearch} color="blue.600" fontSize="xl" />
      </InputLeftElement>
      <Input
        placeholder={placeholder}
        onChange={(event) => {
          if (onChange) {
            onChange(event);
          }
          update(event.target.value);
        }}
      />
      <Fade in={isLoading} unmountOnExit>
        <InputRightElement>
          <Spinner color="blue.600" />
        </InputRightElement>
      </Fade>
    </InputGroup>
  );
};
