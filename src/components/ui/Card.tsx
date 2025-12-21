"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    padding?: "none" | "sm" | "md" | "lg";
}

export function Card({ children, className, hover = false, padding = "md" }: CardProps) {
    const paddingClasses = {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
    };

    return (
        <div
            className={cn(
                "bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-2xl",
                "transition-all duration-200 ease-out",
                hover && "hover:border-[var(--border-secondary)] hover:shadow-[var(--shadow-md)]",
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
        <h3 className={cn("text-lg font-semibold text-[var(--text-primary)]", className)}>
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
