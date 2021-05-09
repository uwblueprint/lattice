import React from "react";
import { Link, LinkProps } from "@chakra-ui/react";

export type ExternalLinkProps = LinkProps;
export const ExternalLink: typeof Link = ({ ...otherProps }) => (
  <Link target="_blank" rel="noopener noreferrer nofollow" {...otherProps} />
);
