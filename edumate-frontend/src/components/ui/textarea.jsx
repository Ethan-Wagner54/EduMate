import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "./utils"; // utility for merging class names
import { textareaVariants } from "./textareaVariants"; // define styles for variants/sizes

function Textarea({ className, variant, size, asChild = false, ...props }) {
    const Comp = asChild ? Slot : "textarea";

    return (
        <Comp
        data-slot="textarea"
        className={cn(textareaVariants({ variant, size, className }))}
        {...props}
        />
    );
}

export { Textarea };
