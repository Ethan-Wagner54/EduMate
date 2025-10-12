import React from "react";
import { cn } from "./utils";

export function Separator({ className, orientation = "horizontal", ...props }) {
  const isHorizontal = orientation === "horizontal";

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "bg-gray-300 dark:bg-gray-600 shrink-0",
        isHorizontal ? "h-px w-full" : "h-full w-px",
        className
      )}
      {...props}
    />
  );
}
