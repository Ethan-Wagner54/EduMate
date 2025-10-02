// radioGroupVariants.js
import { cva } from "class-variance-authority";

export const radioGroupVariants = cva(
    "flex gap-4 items-center",
    {
        variants: {
        variant: {
            default: "",
            vertical: "flex-col gap-2"
        },
        size: {
            sm: "text-sm",
            md: "text-base",
            lg: "text-lg"
        }
        },
        defaultVariants: {
        variant: "default",
        size: "md"
        }
    }
);

export const radioItemVariants = cva(
    "appearance-none w-4 h-4 rounded-full border border-gray-300 checked:bg-purple-600 checked:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500",
    {
        variants: {
        size: {
            sm: "w-3 h-3",
            md: "w-4 h-4",
            lg: "w-5 h-5"
        }
        },
        defaultVariants: {
        size: "md"
        }
    }
);