"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", isLoading, fullWidth, children, disabled, ...props }, ref) => {
        const baseStyles = [
            "inline-flex items-center justify-center gap-2",
            "font-medium rounded-full",
            "transition-all duration-150 ease-out",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",
        ].join(" ");

        const variants = {
            primary: [
                "bg-[var(--accent-primary)] text-[var(--text-inverted)]",
                "hover:bg-[var(--accent-primary-hover)] hover:-translate-y-0.5",
                "focus-visible:ring-[var(--accent-primary)]",
            ].join(" "),
            secondary: [
                "bg-[var(--bg-tertiary)] text-[var(--text-primary)]",
                "border border-[var(--border-primary)]",
                "hover:bg-[var(--bg-secondary)] hover:border-[var(--border-secondary)]",
                "focus-visible:ring-[var(--border-secondary)]",
            ].join(" "),
            ghost: [
                "bg-transparent text-[var(--text-secondary)]",
                "hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]",
                "focus-visible:ring-[var(--border-primary)]",
            ].join(" "),
            danger: [
                "bg-[var(--accent-error)] text-white",
                "hover:opacity-90",
                "focus-visible:ring-[var(--accent-error)]",
            ].join(" "),
        };

        const sizes = {
            sm: "h-8 px-4 text-[13px]",
            md: "h-10 px-5 text-[14px]",
            lg: "h-12 px-6 text-[15px]",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    baseStyles,
                    variants[variant],
                    sizes[size],
                    fullWidth && "w-full",
                    className
                )}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && (
                    <svg
                        className="animate-spin h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="3"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                    </svg>
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";
