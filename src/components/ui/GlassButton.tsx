"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    size?: "sm" | "md" | "lg";
}

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
    ({ className, size = "md", children, ...props }, ref) => {
        const sizeClasses = {
            sm: "h-9 w-9",
            md: "h-11 w-11",
            lg: "h-14 w-14",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center",
                    "rounded-full",
                    "bg-[var(--glass-bg)] backdrop-blur-xl",
                    "border border-[var(--glass-border)]",
                    "text-[var(--text-primary)]",
                    "transition-all duration-200 ease-out",
                    "hover:bg-[var(--bg-tertiary)] hover:scale-105",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    sizeClasses[size],
                    className
                )}
                {...props}
            >
                {children}
            </button>
        );
    }
);

GlassButton.displayName = "GlassButton";
