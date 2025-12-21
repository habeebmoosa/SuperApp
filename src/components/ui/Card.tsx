"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    padding?: "none" | "sm" | "md" | "lg";
    variant?: "default" | "glass" | "dotgrid";
}

export function Card({ children, className, hover = false, padding = "md", variant = "default" }: CardProps) {
    const paddingClasses = {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
    };

    const variantClasses = {
        default: "bg-[var(--bg-elevated)] border border-[var(--border-primary)]",
        glass: "glass",
        dotgrid: "bg-[var(--bg-elevated)] border border-[var(--border-primary)] dot-grid",
    };

    return (
        <div
            className={cn(
                "rounded-2xl",
                "transition-all duration-200 ease-out",
                variantClasses[variant],
                hover && "hover:border-[var(--border-secondary)] hover:shadow-lg hover:-translate-y-1 cursor-pointer",
                paddingClasses[padding],
                className
            )}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn("pb-4 border-b border-[var(--border-primary)] mb-4", className)}>
            {children}
        </div>
    );
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <h3 className={cn("text-lg font-medium text-[var(--text-primary)]", className)}>
            {children}
        </h3>
    );
}

export function CardDescription({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <p className={cn("text-sm text-[var(--text-secondary)] mt-1", className)}>
            {children}
        </p>
    );
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn("", className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn("pt-4 border-t border-[var(--border-primary)] mt-4 flex items-center gap-3", className)}>
            {children}
        </div>
    );
}
