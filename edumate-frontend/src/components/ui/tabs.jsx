import React, { useState } from "react";
import { cn } from "./utils";

export function Tabs({ className, defaultValue, children }) {
  const [activeTab, setActiveTab] = useState(defaultValue || "");

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

export function TabsList({ className, children, activeTab, setActiveTab }) {
  // Clone children to pass activeTab state to TabsTrigger components
  const clonedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;
    return React.cloneElement(child, { activeTab, setActiveTab });
  });

  return (
    <div
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-10 w-fit items-center justify-center rounded-lg p-1 shadow-sm border border-border",
        className
      )}
    >
      {clonedChildren}
    </div>
  );
}

export function TabsTrigger({ className, children, value, activeTab, setActiveTab }) {
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => setActiveTab && setActiveTab(value)}
      className={cn(
        "inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-3 py-1.5 text-sm font-medium transition-all duration-200 disabled:opacity-50",
        isActive
          ? "bg-background text-foreground shadow-sm border-border"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ children, value, activeTab, className }) {
  if (activeTab !== value) return null;

  return <div className={cn("flex-1 outline-none", className)}>{children}</div>;
}
