"use client";

import { useState, useRef, useEffect, useCallback, use } from "react";
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

interface Conversation {
    id: string;
    title: string | null;
    messages: Message[];
    app?: {
        id: string;
        name: string;
        icon: string;
        currentVersion: string;
    };
}

interface PageProps {
    params: Promise<{ conversationId: string }>;
}

export default function ConversationBuilderPage({ params }: PageProps) {
    const { conversationId } = use(params);
    const router = useRouter();

    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Current app config (from latest artifact)
    const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
    const [selectedArtifactIndex, setSelectedArtifactIndex] = useState<number | null>(null);

    const [isSaving, setIsSaving] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"chat" | "preview">("chat");
    const [modelSelection, setModelSelection] = useState<ModelSelection | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load conversation on mount
    useEffect(() => {
        const loadConversation = async () => {
            try {
                const res = await fetch(`/api/conversations/${conversationId}`);
                if (!res.ok) {
                    if (res.status === 404) {
                        router.replace("/builder");
                        return;
                    }
                    throw new Error("Failed to load conversation");
                }

                const data: Conversation = await res.json();
                setConversation(data);
                setMessages(data.messages);

                // Find the latest artifact
                const lastArtifactMessage = [...data.messages].reverse().find(m => m.hasArtifact);
                if (lastArtifactMessage?.artifactConfig) {
                    const config = {
                        ...lastArtifactMessage.artifactConfig,
                        code: lastArtifactMessage.artifactCode
                    } as AppConfig;
                    setAppConfig(config);
                    setSelectedArtifactIndex(data.messages.findIndex(m => m.id === lastArtifactMessage.id));
                    setIsSidebarOpen(true);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load conversation");
            } finally {
                setIsLoading(false);
            }
        };

        loadConversation();
    }, [conversationId, router]);

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
            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: promptText,
                    currentConfig: appConfig,
                    conversationId,
                    provider: modelSelection?.provider,
                    modelId: modelSelection?.modelId,
                }),
            });

            const data = await res.json();

            if (res.ok && data.appConfig) {
                // Refresh messages from server to get persisted versions
                const messagesRes = await fetch(`/api/conversations/${conversationId}/messages`);
                if (messagesRes.ok) {
                    const newMessages = await messagesRes.json();
                    setMessages(newMessages);

                    // Update current app config
                    setAppConfig(data.appConfig);

                    // Find and select the new artifact
                    const lastArtifactIndex = newMessages.findLastIndex((m: Message) => m.hasArtifact);
                    if (lastArtifactIndex >= 0) {
                        setSelectedArtifactIndex(lastArtifactIndex);
                        setIsSidebarOpen(true);
                    }
                }
            } else {
                throw new Error(data.error || "Failed to generate app");
            }
        } catch (err) {
            const errorMessage: Message = {
                id: `error-${Date.now()}`,
                role: "ASSISTANT",
                content: "Sorry, I couldn't generate that. Please try again with more details.",
                hasArtifact: false,
                createdAt: new Date().toISOString()
            };
            setMessages((prev) => [...prev.slice(0, -1), tempUserMessage, errorMessage]);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!appConfig || !conversation) return;
        setIsSaving(true);

        try {
            // Check if app already exists for this conversation
            if (conversation.app?.id) {
                // Update existing app and create new version
                const updateRes = await fetch(`/api/apps/${conversation.app.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: appConfig.metadata.name,
                        description: appConfig.metadata.description,
                        icon: appConfig.metadata.icon,
                        appConfig: { ...appConfig, code: undefined },
                        appCode: appConfig.code
                    }),
                });

                if (!updateRes.ok) throw new Error("Failed to update app");

                // Save new version
                const versionRes = await fetch(`/api/apps/${conversation.app.id}/versions`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        changelog: `Updated via builder conversation`,
                        messageId: messages[selectedArtifactIndex || messages.length - 1]?.id
                    }),
                });

                if (versionRes.ok) {
                    const versionData = await versionRes.json();
                    // Refresh conversation to get updated app info
                    const convRes = await fetch(`/api/conversations/${conversationId}`);
                    if (convRes.ok) {
                        const convData = await convRes.json();
                        setConversation(convData);
                    }
                    alert(`Saved as version ${versionData.version}`);
                }
            } else {
                // Create new app
                const { code, ...configWithoutCode } = appConfig;
                const res = await fetch("/api/apps", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: appConfig.metadata.name,
                        description: appConfig.metadata.description,
                        icon: appConfig.metadata.icon,
                        appConfig: configWithoutCode,
                        appCode: code,
                        originalPrompt: messages.find((m) => m.role === "USER")?.content,
                        conversationId,
                    }),
                });

                if (res.ok) {
                    const app = await res.json();
                    // Update conversation with app reference
                    setConversation(prev => prev ? { ...prev, app } : null);
                    alert(`App saved as version 1.0.0`);
                }
            }
        } catch (error) {
            console.error("Error saving app:", error);
            alert("Failed to save app");
        } finally {
            setIsSaving(false);
        }
    };

    // Get the artifact config for the currently selected message
    const selectedConfig = selectedArtifactIndex !== null && messages[selectedArtifactIndex]?.hasArtifact
        ? {
            ...messages[selectedArtifactIndex].artifactConfig,
            code: messages[selectedArtifactIndex].artifactCode
        } as AppConfig
        : appConfig;

    if (isLoading) {
        return (
            <div className="h-screen bg-[var(--bg-primary)] dot-grid flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 animate-spin text-[var(--text-tertiary)]" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-[var(--text-tertiary)] font-mono text-sm">Loading conversation...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen bg-[var(--bg-primary)] dot-grid flex items-center justify-center">
                <div className="text-center">
                    <p className="text-[var(--accent-error)] mb-4">{error}</p>
                    <Link href="/apps">
                        <Button variant="glass">Back to Apps</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-[var(--bg-primary)] dot-grid flex flex-col overflow-hidden">
            {/* Top Bar */}
            <div className="fixed top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-50 flex items-center justify-between pointer-events-none">
                {/* Back Button */}
                <Link href="/apps" className="pointer-events-auto">
                    <GlassButton size="md">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                    </GlassButton>
                </Link>

                {/* Center: Conversation Info */}
                <div className="hidden sm:flex items-center gap-2 pointer-events-auto">
                    <span className="text-xs font-mono text-[var(--text-tertiary)]">
                        {conversation?.app?.currentVersion ? `v${conversation.app.currentVersion}` : "unsaved"}
                    </span>
                </div>

                {/* Save Button */}
                <div className="flex items-center gap-3 pointer-events-auto">
                    {appConfig && (
                        <Button
                            variant="glass"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            )}
                            <span className="hidden sm:inline">Save App</span>
                        </Button>
                    )}
                </div>
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
                {/* Chat Panel - Independent Scroll */}
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
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
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

                    {/* Chat Input - Fixed at Bottom */}
                    <div className="flex-shrink-0 pb-4 px-4 sm:px-6 sm:pb-6">
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

                {/* Preview Panel - Claude-like Floating Design */}
                {isSidebarOpen && (
                    <div className={`w-full lg:w-1/2 flex flex-col ${activeTab !== "preview" ? "hidden lg:flex" : "flex"
                        } pt-12 lg:pt-0 min-h-0 lg:p-4`}>
                        {/* Floating Preview Container */}
                        <div className="flex-1 min-h-0 flex flex-col bg-[var(--bg-secondary)] lg:rounded-2xl lg:border lg:border-[var(--border-primary)] lg:shadow-2xl lg:shadow-black/20 overflow-hidden">
                            {/* Preview Header */}
                            <div className="flex-shrink-0 h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                                <div className="flex items-center gap-3">
                                    {selectedConfig?.metadata?.icon && (
                                        <span className="text-xl">{selectedConfig.metadata.icon}</span>
                                    )}
                                    <div>
                                        <h2 className="font-medium text-sm sm:text-base">{selectedConfig?.metadata?.name || "Preview"}</h2>
                                        <p className="text-[10px] sm:text-[11px] text-[var(--text-tertiary)] font-mono uppercase tracking-wider">
                                            {selectedArtifactIndex !== null ? `Message ${selectedArtifactIndex + 1}` : "Current"}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                                >
                                    <svg className="w-5 h-5 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Preview Area - Independent Scroll */}
                            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
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
                                    <div className="max-w-lg mx-auto">
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
                                    </div>
                                )}
                            </div>
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
