import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "./utils";
import { radioItemVariants } from "./radioGroupVariants";

// RadioGroup container
function RadioGroup({ className, children, ...props }) {
    return (
        <div className={cn("flex flex-col gap-2", className)} {...props}>
        {children}
        </div>
    );
}

// Individual radio item
function RadioGroupItem({ className, variant, size, asChild = false, label, ...props }) {
    const Comp = asChild ? Slot : "input";

    return (
        <label className="flex items-center gap-2">
        <Comp
            type="radio"
            data-slot="radio-item"
            className={cn(radioItemVariants({ variant, size, className }))}
            {...props}
        />
        {label}
        </label>
    );
}

export { RadioGroup, RadioGroupItem };