"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, Input, GlassButton, ChatInput } from "@/components/ui";
import { ModelSelector } from "@/components/builder";
import type { AppConfig } from "@/schemas/app-config";

interface ModelSelection {
    provider: string;
    modelId: string;
}

interface Message {
    id: string;
    role: "USER" | "ASSISTANT" | "SYSTEM";
    content: string;
    hasArtifact: boolean;
    artifactName?: string;
    artifactIcon?: string;
    artifactConfig?: Partial<AppConfig>;
    artifactCode?: string;
    createdAt: string;
}

export default function BuilderPage() {
    const router = useRouter();

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    // Current app config (from latest artifact)
    const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
    const [selectedArtifactIndex, setSelectedArtifactIndex] = useState<number | null>(null);

    const [isSaving, setIsSaving] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"chat" | "preview">("chat");
    const [modelSelection, setModelSelection] = useState<ModelSelection | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const handleModelChange = useCallback((selection: ModelSelection | null) => {
        setModelSelection(selection);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Handle artifact click - show that artifact's preview
    const handleArtifactClick = (messageIndex: number) => {
        const message = messages[messageIndex];
        if (message?.hasArtifact && message.artifactConfig) {
            const config = {
                ...message.artifactConfig,
                code: message.artifactCode
            } as AppConfig;
            setAppConfig(config);
            setSelectedArtifactIndex(messageIndex);
            setIsSidebarOpen(true);
            setActiveTab("preview");
        }
    };

    const handleSubmit = async () => {
        if (!input.trim() || isGenerating) return;

        // Optimistic UI update for user message
        const tempUserMessage: Message = {
            id: `temp-${Date.now()}`,
            role: "USER",
            content: input,
            hasArtifact: false,
            createdAt: new Date().toISOString()
        };

        setMessages((prev) => [...prev, tempUserMessage]);
        const promptText = input;
        setInput("");
        setIsGenerating(true);

        try {
            // Create a new conversation with the first prompt
            const convRes = await fetch("/api/conversations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: promptText.substring(0, 100) }),
            });

            if (!convRes.ok) {
                throw new Error("Failed to create conversation");
            }

            const conversation = await convRes.json();

            // Now generate with the new conversation ID
            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: promptText,
                    currentConfig: appConfig,
                    conversationId: conversation.id,
                    provider: modelSelection?.provider,
                    modelId: modelSelection?.modelId,
                }),
            });

            const data = await res.json();

            if (res.ok && data.appConfig) {
                // Redirect to the conversation page
                router.push(`/builder/${conversation.id}`);
            } else {
                throw new Error(data.error || "Failed to generate app");
            }
        } catch (err) {
            const errorMessage: Message = {
                id: `error-${Date.now()}`,
                role: "ASSISTANT",
                content: err instanceof Error ? err.message : "Sorry, I couldn't generate that. Please try again with more details.",
                hasArtifact: false,
                createdAt: new Date().toISOString()
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsGenerating(false);
        }
    };

    // Get the artifact config for the currently selected message
    const selectedConfig = selectedArtifactIndex !== null && messages[selectedArtifactIndex]?.hasArtifact
        ? {
            ...messages[selectedArtifactIndex].artifactConfig,
            code: messages[selectedArtifactIndex].artifactCode
        } as AppConfig
        : appConfig;

    return (
        <div className="h-screen bg-[var(--bg-primary)] dot-grid flex flex-col overflow-hidden">
            {/* Top Bar - Only Back Button */}
            <div className="fixed top-4 sm:top-6 left-4 sm:left-6 z-50 pointer-events-none">
                {/* Back Button */}
                <Link href="/apps" className="pointer-events-auto">
                    <GlassButton size="md">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                    </GlassButton>
                </Link>
            </div>

            {/* Mobile Tab Switcher */}
            <div className="lg:hidden fixed top-16 left-0 right-0 z-40 bg-[var(--bg-secondary)] border-b border-[var(--border-primary)]">
                <div className="flex">
                    <button
                        onClick={() => setActiveTab("chat")}
                        className={`flex-1 py-3 text-sm font-mono uppercase tracking-wider transition-colors ${activeTab === "chat"
                            ? "text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]"
                            : "text-[var(--text-tertiary)]"
                            }`}
                    >
                        Chat
                    </button>
                    <button
                        onClick={() => setActiveTab("preview")}
                        className={`flex-1 py-3 text-sm font-mono uppercase tracking-wider transition-colors ${activeTab === "preview"
                            ? "text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]"
                            : "text-[var(--text-tertiary)]"
                            }`}
                    >
                        Preview
                        {appConfig && (
                            <span className="ml-2 w-2 h-2 bg-[var(--accent-success)] rounded-full inline-block" />
                        )}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex pt-16 sm:pt-20 lg:pt-20 min-h-0 overflow-hidden">
                {/* Chat Panel */}
                <div className={`${isSidebarOpen ? 'lg:w-1/2' : 'lg:w-full lg:max-w-4xl lg:mx-auto'} w-full flex flex-col ${activeTab !== "chat" ? "hidden lg:flex" : "flex"
                    } pt-12 lg:pt-0 transition-all duration-300 min-h-0`}>
                    {/* Messages - Scrollable (hidden overflow when empty to prevent scrollbar) */}
                    <div className={`flex-1 min-h-0 p-4 sm:p-6 space-y-4 ${messages.length > 0 ? 'overflow-y-auto' : 'overflow-hidden'}`}>
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center px-4">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 glass rounded-2xl flex items-center justify-center mb-4 sm:mb-5">
                                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg sm:text-xl font-light mb-2 sm:mb-3">Start Building</h3>
                                <p className="text-xs sm:text-sm text-[var(--text-tertiary)] max-w-xs mb-4 sm:mb-6 font-mono">
                                    Describe the app you want to create in natural language.
                                </p>
                                <div className="space-y-2 text-xs sm:text-sm text-[var(--text-tertiary)] font-mono">
                                    <p className="glass px-3 sm:px-4 py-2 rounded-full">&ldquo;Create an expense tracker&rdquo;</p>
                                    <p className="glass px-3 sm:px-4 py-2 rounded-full">&ldquo;Build a habit tracker&rdquo;</p>
                                    <p className="glass px-3 sm:px-4 py-2 rounded-full">&ldquo;Make a note-taking app&rdquo;</p>
                                </div>
                            </div>
                        )}

                        {messages.map((message, index) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === "USER" ? "justify-end" : "justify-start"} animate-fadeInUp`}
                            >
                                <div className="max-w-[90%] sm:max-w-[85%]">
                                    <div
                                        className={`rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 ${message.role === "USER"
                                            ? "bg-[var(--accent-primary)] text-black font-medium"
                                            : "glass"
                                            }`}
                                    >
                                        <p className="text-sm leading-relaxed">{message.content}</p>
                                    </div>

                                    {/* Artifact Badge */}
                                    {message.hasArtifact && (
                                        <button
                                            onClick={() => handleArtifactClick(index)}
                                            className={`mt-2 flex items-center gap-2 px-3 py-2 rounded-xl border transition-all hover:scale-[1.02] ${selectedArtifactIndex === index
                                                ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                                                : 'border-[var(--border-primary)] glass hover:border-[var(--accent-primary)]/50'
                                                }`}
                                        >
                                            <span className="text-lg">{message.artifactIcon || "🤖"}</span>
                                            <span className="text-xs font-mono text-[var(--text-secondary)]">
                                                {message.artifactName || "App"}
                                            </span>
                                            <svg className="w-3 h-3 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isGenerating && (
                            <div className="flex justify-start animate-fadeInUp">
                                <div className="glass rounded-2xl px-5 py-4">
                                    <div className="flex gap-1.5">
                                        <span className="w-2 h-2 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <span className="w-2 h-2 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <span className="w-2 h-2 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input - Fixed at bottom */}
                    <div className="flex-shrink-0 p-4 sm:p-6 pt-0">
                        <ChatInput
                            value={input}
                            onChange={setInput}
                            onSubmit={handleSubmit}
                            placeholder="Describe what you want to build..."
                            disabled={isGenerating}
                            isLoading={isGenerating}
                            modelSelector={
                                <ModelSelector
                                    onSelectionChange={handleModelChange}
                                    disabled={isGenerating}
                                />
                            }
                        />
                    </div>
                </div>

                {/* Preview Panel (Collapsible Sidebar) */}
                {isSidebarOpen && (
                    <div className={`w-full lg:w-1/2 flex flex-col bg-[var(--bg-secondary)] ${activeTab !== "preview" ? "hidden lg:flex" : "flex"
                        } pt-12 lg:pt-0 min-h-0`}>
                        {/* Preview Header */}
                        <div className="flex-shrink-0 h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between border-b border-[var(--border-primary)]">
                            <div>
                                <h2 className="font-medium text-sm sm:text-base">{selectedConfig?.metadata?.name || "Preview"}</h2>
                                <p className="text-[10px] sm:text-[11px] text-[var(--text-tertiary)] font-mono uppercase tracking-wider">
                                    {selectedArtifactIndex !== null ? `Message ${selectedArtifactIndex + 1}` : "Current"}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="hidden lg:flex p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                            >
                                <svg className="w-5 h-5 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Preview Area - Scrollable */}
                        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 dot-grid">
                            {!selectedConfig ? (
                                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 glass rounded-2xl flex items-center justify-center mb-4 sm:mb-5">
                                        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-xs sm:text-sm text-[var(--text-tertiary)] font-mono">
                                        Your app preview will appear here
                                    </p>
                                </div>
                            ) : (
                                <Card padding="lg" className="max-w-lg mx-auto">
                                    {/* App Header */}
                                    <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6 pb-5 sm:pb-6 border-b border-[var(--border-primary)]">
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[var(--accent-primary)]/10 rounded-xl flex items-center justify-center text-xl sm:text-2xl">
                                            {selectedConfig.metadata.icon || "🤖"}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-base sm:text-lg truncate">{selectedConfig.metadata.name}</h3>
                                            <p className="text-xs sm:text-sm text-[var(--text-secondary)] truncate">{selectedConfig.metadata.description}</p>
                                        </div>
                                    </div>

                                    {/* Input Fields Preview */}
                                    <div className="space-y-3 sm:space-y-4">
                                        {selectedConfig.inputs?.map((field) => (
                                            <Input
                                                key={field.id}
                                                label={`${field.label}${field.required ? " *" : ""}`}
                                                type={field.type === "textarea" ? "text" : field.type as string}
                                                placeholder={field.placeholder}
                                                mono
                                            />
                                        ))}
                                    </div>

                                    {/* Run Button */}
                                    <Button className="w-full mt-5 sm:mt-6" size="lg">
                                        Run App
                                    </Button>

                                    {/* Output Preview */}
                                    {selectedConfig.outputs && selectedConfig.outputs.length > 0 && (
                                        <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-[var(--border-primary)]">
                                            <p className="text-[10px] sm:text-[11px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
                                                Output
                                            </p>
                                            <div className="p-3 sm:p-4 glass rounded-xl">
                                                <p className="text-xs sm:text-sm text-[var(--text-tertiary)] italic font-mono">
                                                    Output will appear here after running the app
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            )}
                        </div>
                    </div>
                )}

                {/* Sidebar Toggle Button (when closed) */}
                {!isSidebarOpen && appConfig && (
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 items-center gap-2 px-3 py-2 glass rounded-l-xl border border-[var(--border-primary)] border-r-0 hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                        <span className="text-lg">{appConfig.metadata.icon || "🤖"}</span>
                        <svg className="w-4 h-4 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}
