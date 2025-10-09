import React, { useState, useMemo, useContext, createContext } from "react";
import { cn } from "./utils";

const TabsContext = createContext({ activeTab: "", setActiveTab: () => {} });

export function Tabs({ className, defaultValue, value, onValueChange, children }) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue || "");
  const activeTab = isControlled ? value : internal;
  const setActiveTab = (v) => {
    if (onValueChange) onValueChange(v);
    if (!isControlled) setInternal(v);
  };
  const ctx = useMemo(() => ({ activeTab, setActiveTab }), [activeTab]);

  return (
    <TabsContext.Provider value={ctx}>
      <div className={cn("flex flex-col gap-2", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children }) {
  return (
    <div
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-10 w-fit items-center justify-center rounded-lg p-1 shadow-sm border border-border",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ className, children, value }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => setActiveTab(value)}
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

export function TabsContent({ children, value, className }) {
  const { activeTab } = useContext(TabsContext);
  if (activeTab !== value) return null;

  return <div className={cn("flex-1 outline-none", className)}>{children}</div>;
}
