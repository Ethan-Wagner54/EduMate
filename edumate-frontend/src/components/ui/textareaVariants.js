// textareaVariants.js
import { cva } from "class-variance-authority";

export const textareaVariants = cva(
    "block w-full rounded-md border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500",
    {
        variants: {
        variant: {
            default: "border-gray-300 bg-white text-black",
            ghost: "border-transparent bg-transparent text-white",
            error: "border-red-500 bg-red-50 text-red-700"
        },
        size: {
            sm: "text-sm h-20",
            md: "text-base h-32",
            lg: "text-lg h-40"
        }
        },
        defaultVariants: {
        variant: "default",
        size: "md"
        }
    }
);
