import React, { useState } from "react";
import { cn } from "./utils";

export function Switch({ className, defaultChecked = false, onChange }) {
  const [checked, setChecked] = useState(defaultChecked);

  const toggle = () => {
    const newValue = !checked;
    setChecked(newValue);
    if (onChange) onChange(newValue);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={toggle}
      className={cn(
        "peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent transition-all outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-50",
        checked
          ? "bg-purple-600"
          : "bg-gray-300 dark:bg-gray-600",
        className
      )}
    >
      <span
        className={cn(
          "block h-4 w-4 bg-white rounded-full shadow transform transition-transform",
          checked ? "translate-x-[100%] -translate-x-1" : "translate-x-0"
        )}
      />
    </button>
  );
}
