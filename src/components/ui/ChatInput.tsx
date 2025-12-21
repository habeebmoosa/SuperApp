"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    placeholder?: string;
    disabled?: boolean;
    isLoading?: boolean;
    className?: string;
}

export function ChatInput({
    value,
    onChange,
    onSubmit,
    placeholder = "Describe what you want to build...",
    disabled = false,
    isLoading = false,
    className,
}: ChatInputProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [value]);

    // Initialize speech recognition
    useEffect(() => {
        if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event) => {
                let finalTranscript = "";
                let interimTranscript = "";

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                if (finalTranscript) {
                    onChange(value + finalTranscript);
                }
            };

            recognitionRef.current.onerror = () => {
                setIsRecording(false);
            };

            recognitionRef.current.onend = () => {
                setIsRecording(false);
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [onChange, value]);

    const toggleRecording = () => {
        if (!recognitionRef.current) return;

        if (isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        } else {
            recognitionRef.current.start();
            setIsRecording(true);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim() && !disabled && !isLoading) {
                onSubmit();
            }
        }
    };

    const hasVoiceSupport = typeof window !== "undefined" &&
        ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

    return (
        <div
            className={cn(
                "relative flex items-end gap-2",
                "bg-[var(--bg-secondary)] border border-[var(--border-primary)]",
                "rounded-2xl",
                "transition-all duration-200",
                isFocused && "border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/10",
                className
            )}
        >
            {/* Input Area */}
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled || isLoading}
                rows={1}
                className={cn(
                    "flex-1 resize-none",
                    "py-4 pl-5 pr-2",
                    "text-[15px] text-[var(--text-primary)] font-mono",
                    "bg-transparent",
                    "placeholder:text-[var(--text-tertiary)]",
                    "focus:outline-none",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "max-h-[200px]"
                )}
            />

            {/* Action Buttons */}
            <div className="flex items-center gap-1 p-2">
                {/* Voice Input Button */}
                {hasVoiceSupport && (
                    <button
                        type="button"
                        onClick={toggleRecording}
                        disabled={disabled || isLoading}
                        className={cn(
                            "h-10 w-10 rounded-full",
                            "flex items-center justify-center",
                            "transition-all duration-200",
                            isRecording
                                ? "bg-[var(--accent-error)] text-white animate-pulse"
                                : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]",
                            "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                    >
                        {isRecording ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <rect x="6" y="6" width="12" height="12" rx="1" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                            </svg>
                        )}
                    </button>
                )}

                {/* Send Button */}
                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={!value.trim() || disabled || isLoading}
                    className={cn(
                        "h-10 w-10 rounded-full",
                        "flex items-center justify-center",
                        "transition-all duration-200",
                        value.trim() && !disabled && !isLoading
                            ? "bg-[var(--accent-primary)] text-[var(--text-inverted)] hover:brightness-110 hover:scale-105"
                            : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                >
                    {isLoading ? (
                        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
}

// Add TypeScript declarations for Web Speech API
declare global {
    interface Window {
        SpeechRecognition: typeof SpeechRecognition;
        webkitSpeechRecognition: typeof SpeechRecognition;
    }
}
