"use client";

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    mono?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, helperText, id, type = "text", mono, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

        return (
            <div className="flex flex-col gap-1.5">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="text-[12px] font-medium text-[var(--text-secondary)] font-mono uppercase tracking-wider"
                    >
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    type={type}
                    className={cn(
                        "w-full h-12 px-4",
                        "text-[15px] text-[var(--text-primary)]",
                        mono && "font-mono",
                        "bg-[var(--bg-secondary)] border border-[var(--border-primary)]",
                        "rounded-xl",
                        "placeholder:text-[var(--text-tertiary)]",
                        "transition-all duration-200 ease-out",
                        "focus:outline-none focus:border-[var(--accent-primary)] focus:bg-[var(--bg-primary)]",
                        "focus:ring-2 focus:ring-[var(--accent-primary)]/10",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        error && "border-[var(--accent-error)] focus:border-[var(--accent-error)] focus:ring-[var(--accent-error)]/10",
                        className
                    )}
                    {...props}
                />
                {(error || helperText) && (
                    <p
                        className={cn(
                            "text-[11px] font-mono",
                            error ? "text-[var(--accent-error)]" : "text-[var(--text-tertiary)]"
                        )}
                    >
                        {error || helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

// Textarea component
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
    mono?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, error, helperText, id, mono, ...props }, ref) => {
        const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

        return (
            <div className="flex flex-col gap-1.5">
                {label && (
                    <label
                        htmlFor={textareaId}
                        className="text-[12px] font-medium text-[var(--text-secondary)] font-mono uppercase tracking-wider"
                    >
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={textareaId}
                    className={cn(
                        "w-full min-h-[120px] px-4 py-3",
                        "text-[15px] text-[var(--text-primary)]",
                        mono && "font-mono",
                        "bg-[var(--bg-secondary)] border border-[var(--border-primary)]",
                        "rounded-xl resize-none",
                        "placeholder:text-[var(--text-tertiary)]",
                        "transition-all duration-200 ease-out",
                        "focus:outline-none focus:border-[var(--accent-primary)] focus:bg-[var(--bg-primary)]",
                        "focus:ring-2 focus:ring-[var(--accent-primary)]/10",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        error && "border-[var(--accent-error)] focus:border-[var(--accent-error)]",
                        className
                    )}
                    {...props}
                />
                {(error || helperText) && (
                    <p
                        className={cn(
                            "text-[11px] font-mono",
                            error ? "text-[var(--accent-error)]" : "text-[var(--text-tertiary)]"
                        )}
                    >
                        {error || helperText}
                    </p>
                )}
            </div>
        );
    }
);

Textarea.displayName = "Textarea";
