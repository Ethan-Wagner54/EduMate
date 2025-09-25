import React, { useState } from "react";
import { cn } from "./utils";

export function Tabs({ className, defaultValue, children }) {
  const [activeTab, setActiveTab] = useState(defaultValue || 0);

  // Clone children to pass activeTab state
  const clonedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;
    return React.cloneElement(child, { activeTab, setActiveTab });
  });

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {clonedChildren}
    </div>
  );
}

export function TabsList({ className, children }) {
  return (
    <div
      className={cn(
        "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 inline-flex h-9 w-fit items-center justify-center rounded-xl p-[3px]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ className, children, index, activeTab, setActiveTab }) {
  const isActive = activeTab === index;

  return (
    <button
      onClick={() => setActiveTab(index)}
      className={cn(
        "inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1 text-sm font-medium transition-colors disabled:opacity-50",
        isActive
          ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ children, index, activeTab, className }) {
  if (activeTab !== index) return null;

  return <div className={cn("flex-1 outline-none", className)}>{children}</div>;
}
