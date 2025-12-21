"use client";

import { cn } from "@/lib/utils";

interface DotGridProps {
    className?: string;
    children?: React.ReactNode;
    subtle?: boolean;
}

export function DotGrid({ className, children, subtle = false }: DotGridProps) {
    return (
        <div
            className={cn(
                "dot-grid",
                subtle && "dot-grid-subtle",
                className
            )}
        >
            {children}
        </div>
    );
}

// Full-screen dot grid background
export function DotGridBackground({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("min-h-screen bg-[var(--bg-primary)] dot-grid", className)}>
            {children}
        </div>
    );
}
