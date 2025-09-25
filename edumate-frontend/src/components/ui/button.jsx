import React from "react";
import { cn } from "./utils";

export function Button({ children, className, variant = "default", size = "default", asChild = false, ...props }) {
  const Comp = asChild ? "span" : "button"; // simple replacement for Slot

  const buttonVariants = {
    variant: {
      default: "bg-purple-600 text-white hover:bg-purple-700",
      destructive: "bg-red-600 text-white hover:bg-red-700",
      outline: "border border-gray-300 bg-white text-gray-800 hover:bg-gray-100",
      secondary: "bg-gray-500 text-white hover:bg-gray-600",
      ghost: "bg-transparent hover:bg-gray-100",
      link: "text-purple-600 underline hover:text-purple-700",
    },
    size: {
      default: "h-9 px-4 py-2",
      sm: "h-8 px-3 text-sm",
      lg: "h-10 px-6 text-lg",
      icon: "h-9 w-9 p-0",
    },
  };

  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus:outline-none focus:ring-2 focus:ring-offset-1",
        buttonVariants.variant[variant],
        buttonVariants.size[size],
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}
