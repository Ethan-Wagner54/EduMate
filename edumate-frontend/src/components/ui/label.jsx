"use client";

import React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "./utils";

export function Label({ children, className, ...props }) {
  return (
    <label
      className={cn(
        "flex items-center gap-2 text-sm font-medium select-none",
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
}
