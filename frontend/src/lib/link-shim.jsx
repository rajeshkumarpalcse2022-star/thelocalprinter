"use client";

import NextLink from "next/link";
import { forwardRef } from "react";

const Link = forwardRef(function Link({ href, to, children, ...props }, ref) {
  return (
    <NextLink ref={ref} href={href || to || "/"} {...props}>
      {children}
    </NextLink>
  );
});

Link.displayName = "Link";

export default Link;
