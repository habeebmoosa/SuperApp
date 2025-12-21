"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "danger" | "glass";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    fullWidth?: boolean;
    iconOnly?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", isLoading, fullWidth, iconOnly, children, disabled, ...props }, ref) => {
        const baseStyles = [
            "inline-flex items-center justify-center gap-2",
            "font-medium rounded-full",
            "font-mono uppercase tracking-wide",
            "transition-all duration-200 ease-out",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",
        ].join(" ");

        const variants = {
            primary: [
                "bg-[var(--accent-primary)] text-[var(--text-inverted)]",
                "hover:brightness-110 hover:-translate-y-0.5 hover:shadow-lg",
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
                "hover:opacity-90 hover:-translate-y-0.5",
                "focus-visible:ring-[var(--accent-error)]",
            ].join(" "),
            glass: [
                "bg-[var(--glass-bg)] backdrop-blur-xl",
                "border border-[var(--glass-border)]",
                "text-[var(--text-primary)]",
                "hover:bg-[var(--bg-tertiary)]",
                "focus-visible:ring-[var(--border-secondary)]",
            ].join(" "),
        };

        const sizes = {
            sm: iconOnly ? "h-8 w-8 p-0" : "h-8 px-4 text-[12px]",
            md: iconOnly ? "h-10 w-10 p-0" : "h-10 px-5 text-[13px]",
            lg: iconOnly ? "h-12 w-12 p-0" : "h-12 px-6 text-[14px]",
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
