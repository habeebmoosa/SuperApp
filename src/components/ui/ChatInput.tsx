"use client";

import { useState, useRef, useEffect, KeyboardEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    placeholder?: string;
    disabled?: boolean;
    isLoading?: boolean;
    className?: string;
    modelSelector?: ReactNode;
}

export function ChatInput({
    value,
    onChange,
    onSubmit,
    placeholder = "Describe what you want to build...",
    disabled = false,
    isLoading = false,
    className,
    modelSelector,
}: ChatInputProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    const hasText = value.trim().length > 0;

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

    // Handle action button click - either send or start voice
    const handleActionButtonClick = () => {
        if (hasText) {
            onSubmit();
        } else if (hasVoiceSupport) {
            toggleRecording();
        }
    };

    return (
        <div
            className={cn(
                "relative flex items-end",
                "bg-[var(--bg-secondary)] border border-[var(--border-primary)]",
                "rounded-2xl",
                "transition-all duration-200",
                isFocused && "border-[var(--border-secondary)] ring-1 ring-[var(--border-secondary)]",
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
                    "py-4 pl-5 pr-3",
                    "text-[15px] text-[var(--text-primary)]",
                    "bg-transparent border-none",
                    "placeholder:text-[var(--text-tertiary)]",
                    "focus:outline-none focus:ring-0 focus:border-transparent focus:shadow-none",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "max-h-[200px]"
                )}
                style={{
                    outline: 'none',
                    boxShadow: 'none',
                    border: 'none'
                }}
            />

            {/* Right Side Actions */}
            <div className="flex items-center justify-center gap-1 my-auto px-2">
                {/* Model Selector */}
                {modelSelector}

                {/* Send/Voice Button */}
                <button
                    type="button"
                    onClick={handleActionButtonClick}
                    disabled={disabled || isLoading || (!hasText && !hasVoiceSupport)}
                    className={cn(
                        "h-10 w-10 rounded-full",
                        "flex items-center justify-center",
                        "transition-all duration-200",
                        isRecording
                            ? "bg-[var(--accent-error)] text-white animate-pulse"
                            : hasText
                                ? "bg-[var(--accent-primary)] text-[var(--text-inverted)] hover:brightness-110 hover:scale-105"
                                : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                >
                    {isLoading ? (
                        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    ) : isRecording ? (
                        // Stop recording icon
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <rect x="6" y="6" width="12" height="12" rx="1" />
                        </svg>
                    ) : hasText ? (
                        // Send icon (up arrow like in the reference)
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
                        </svg>
                    ) : (
                        // Microphone icon (voice input)
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
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
