"use client";

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, helperText, id, type = "text", ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

        return (
            <div className="flex flex-col gap-1.5">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="text-[13px] font-medium text-[var(--text-secondary)]"
                    >
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    type={type}
                    className={cn(
                        "w-full h-11 px-4",
                        "text-[15px] text-[var(--text-primary)]",
                        "bg-[var(--bg-secondary)] border border-[var(--border-primary)]",
                        "rounded-[10px]",
                        "placeholder:text-[var(--text-tertiary)]",
                        "transition-all duration-150 ease-out",
                        "focus:outline-none focus:border-[var(--accent-primary)] focus:bg-[var(--bg-primary)]",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        error && "border-[var(--accent-error)] focus:border-[var(--accent-error)]",
                        className
                    )}
                    {...props}
                />
                {(error || helperText) && (
                    <p
                        className={cn(
                            "text-[12px]",
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
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, error, helperText, id, ...props }, ref) => {
        const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

        return (
            <div className="flex flex-col gap-1.5">
                {label && (
                    <label
                        htmlFor={textareaId}
                        className="text-[13px] font-medium text-[var(--text-secondary)]"
                    >
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={textareaId}
                    className={cn(
                        "w-full min-h-[100px] px-4 py-3",
                        "text-[15px] text-[var(--text-primary)]",
                        "bg-[var(--bg-secondary)] border border-[var(--border-primary)]",
                        "rounded-[10px] resize-none",
                        "placeholder:text-[var(--text-tertiary)]",
                        "transition-all duration-150 ease-out",
                        "focus:outline-none focus:border-[var(--accent-primary)] focus:bg-[var(--bg-primary)]",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        error && "border-[var(--accent-error)] focus:border-[var(--accent-error)]",
                        className
                    )}
                    {...props}
                />
                {(error || helperText) && (
                    <p
                        className={cn(
                            "text-[12px]",
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
