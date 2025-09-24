import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "./utils";
import { selectVariants } from "./selectVariants";

// Main Select wrapper
function Select({ className, variant, size, asChild = false, ...props }) {
    const Comp = asChild ? Slot : "select";

    return (
        <Comp
        data-slot="select"
        className={cn(selectVariants({ variant, size, className }))}
        {...props}
        />
    );
}

// Trigger button
function SelectTrigger({ children, className, ...props }) {
    return (
        <button className={cn("px-3 py-2 border rounded", className)} {...props}>
        {children}
        </button>
    );
}

// Display selected value
function SelectValue({ children, className, ...props }) {
    return (
        <span className={cn("text-sm", className)} {...props}>
        {children}
        </span>
    );
}

// Dropdown content
    function SelectContent({ children, className, ...props }) {
    return (
        <div className={cn("border rounded shadow-md mt-2", className)} {...props}>
        {children}
        </div>
    );
}

// Individual item
function SelectItem({ children, className, ...props }) {
    return (
        <div className={cn("px-3 py-2 hover:bg-gray-100 cursor-pointer", className)} {...props}>
        {children}
        </div>
    );
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };