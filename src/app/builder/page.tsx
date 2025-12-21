"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, Input, GlassButton, ChatInput } from "@/components/ui";
import type { AppConfig } from "@/schemas/app-config";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

export default function AppBuilderPage() {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = async () => {
        if (!input.trim() || isGenerating) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsGenerating(true);

        try {
            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: input,
                    currentConfig: appConfig,
                }),
            });

            const data = await res.json();

            if (res.ok && data.appConfig) {
                setAppConfig(data.appConfig);

                const assistantMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: `I've ${appConfig ? "updated" : "created"} your app "${data.appConfig.metadata.name}". ${data.appConfig.metadata.description || ""}`,
                };
                setMessages((prev) => [...prev, assistantMessage]);
            } else {
                throw new Error(data.error || "Failed to generate app");
            }
        } catch {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Sorry, I couldn't generate that. Please try again with more details.",
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!appConfig) return;
        setIsSaving(true);

        try {
            const res = await fetch("/api/apps", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: appConfig.metadata.name,
                    description: appConfig.metadata.description,
                    icon: appConfig.metadata.icon,
                    appConfig,
                    originalPrompt: messages.find((m) => m.role === "user")?.content,
                }),
            });

            if (res.ok) {
                const app = await res.json();
                router.push(`/apps/${app.id}`);
            }
        } catch (error) {
            console.error("Error saving app:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="h-screen bg-[var(--bg-primary)] dot-grid flex flex-col">
            {/* Top Bar - Glass Buttons */}
            <div className="fixed top-6 left-6 right-6 z-50 flex items-center justify-between pointer-events-none">
                {/* Back Button */}
                <Link href="/apps" className="pointer-events-auto">
                    <GlassButton size="md">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                    </GlassButton>
                </Link>

                {/* Save Button */}
                {appConfig && (
                    <Button
                        variant="glass"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="pointer-events-auto"
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
                        Save App
                    </Button>
                )}
            </div>

            {/* Main Content - Split View */}
            <div className="flex-1 flex pt-20">
                {/* Chat Panel */}
                <div className="w-1/2 flex flex-col border-r border-[var(--border-primary)]">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mb-5">
                                    <svg className="w-8 h-8 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-light mb-3">Start Building</h3>
                                <p className="text-sm text-[var(--text-tertiary)] max-w-xs mb-6 font-mono">
                                    Describe the app you want to create in natural language.
                                </p>
                                <div className="space-y-2 text-sm text-[var(--text-tertiary)] font-mono">
                                    <p className="glass px-4 py-2 rounded-full">&ldquo;Create an expense tracker&rdquo;</p>
                                    <p className="glass px-4 py-2 rounded-full">&ldquo;Build a habit tracker&rdquo;</p>
                                    <p className="glass px-4 py-2 rounded-full">&ldquo;Make a note-taking app&rdquo;</p>
                                </div>
                            </div>
                        )}

                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fadeInUp`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-5 py-3.5 ${message.role === "user"
                                            ? "bg-[var(--accent-primary)] text-[var(--text-inverted)]"
                                            : "glass"
                                        }`}
                                >
                                    <p className="text-sm leading-relaxed font-mono">{message.content}</p>
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

                    {/* Chat Input */}
                    <div className="p-6 pt-0">
                        <ChatInput
                            value={input}
                            onChange={setInput}
                            onSubmit={handleSubmit}
                            placeholder="Describe what you want to build..."
                            disabled={isGenerating}
                            isLoading={isGenerating}
                        />
                    </div>
                </div>

                {/* Preview Panel */}
                <div className="w-1/2 flex flex-col bg-[var(--bg-secondary)]">
                    {/* Preview Header */}
                    <div className="h-16 px-6 flex items-center justify-between border-b border-[var(--border-primary)]">
                        <div>
                            <h2 className="font-medium">{appConfig?.metadata?.name || "Preview"}</h2>
                            <p className="text-[11px] text-[var(--text-tertiary)] font-mono uppercase tracking-wider">
                                Live app preview
                            </p>
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div className="flex-1 overflow-y-auto p-6 dot-grid">
                        {!appConfig ? (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 glass rounded-2xl flex items-center justify-center mb-5">
                                    <svg className="w-10 h-10 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-sm text-[var(--text-tertiary)] font-mono">
                                    Your app preview will appear here
                                </p>
                            </div>
                        ) : (
                            <Card padding="lg" className="max-w-lg mx-auto">
                                {/* App Header */}
                                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[var(--border-primary)]">
                                    <div className="w-14 h-14 bg-[var(--accent-primary)]/10 rounded-xl flex items-center justify-center text-2xl">
                                        {appConfig.metadata.icon || "🤖"}
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-lg">{appConfig.metadata.name}</h3>
                                        <p className="text-sm text-[var(--text-secondary)]">{appConfig.metadata.description}</p>
                                    </div>
                                </div>

                                {/* Input Fields Preview */}
                                <div className="space-y-4">
                                    {appConfig.inputs.map((field) => (
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
                                <Button className="w-full mt-6" size="lg">
                                    Run App
                                </Button>

                                {/* Output Preview */}
                                {appConfig.outputs.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-[var(--border-primary)]">
                                        <p className="text-[11px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
                                            Output
                                        </p>
                                        <div className="p-4 glass rounded-xl">
                                            <p className="text-sm text-[var(--text-tertiary)] italic font-mono">
                                                Output will appear here after running the app
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
