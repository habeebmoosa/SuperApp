"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Card } from "@/components/ui";
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
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
        }
    };

    return (
        <div className="h-screen flex bg-[var(--bg-primary)]">
            {/* Chat Panel */}
            <div className="w-1/2 border-r border-[var(--border-primary)] flex flex-col">
                {/* Header */}
                <header className="h-16 px-6 flex items-center justify-between border-b border-[var(--border-primary)]">
                    <div>
                        <h1 className="font-semibold">App Builder</h1>
                        <p className="text-xs text-[var(--text-secondary)]">Describe what you want to build</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => router.push("/apps")}>
                        Cancel
                    </Button>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <div className="w-14 h-14 bg-[var(--bg-tertiary)] rounded-xl flex items-center justify-center mb-4">
                                <svg className="w-7 h-7 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold mb-2">Start Building</h3>
                            <p className="text-sm text-[var(--text-tertiary)] max-w-xs mb-4">
                                Describe the app you want to create in natural language.
                            </p>
                            <div className="space-y-2 text-sm text-[var(--text-tertiary)]">
                                <p>&ldquo;Create an expense tracker&rdquo;</p>
                                <p>&ldquo;Build a habit tracker&rdquo;</p>
                                <p>&ldquo;Make a note-taking app&rdquo;</p>
                            </div>
                        </div>
                    )}

                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === "user"
                                        ? "bg-[var(--accent-primary)] text-[var(--text-inverted)]"
                                        : "bg-[var(--bg-secondary)] border border-[var(--border-primary)]"
                                    }`}
                            >
                                <p className="text-sm">{message.content}</p>
                            </div>
                        </div>
                    ))}

                    {isGenerating && (
                        <div className="flex justify-start">
                            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl px-4 py-3">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <span className="w-2 h-2 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <span className="w-2 h-2 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-4 border-t border-[var(--border-primary)]">
                    <div className="flex gap-3">
                        <Input
                            value={input}
                            onChange={(e: any) => setInput(e.target.value)}
                            placeholder="Describe what you want to build..."
                            disabled={isGenerating}
                            className="flex-1"
                        />
                        <Button type="submit" disabled={!input.trim() || isGenerating}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </Button>
                    </div>
                </form>
            </div>

            {/* Preview Panel */}
            <div className="w-1/2 flex flex-col bg-[var(--bg-secondary)]">
                {/* Header */}
                <header className="h-16 px-6 flex items-center justify-between border-b border-[var(--border-primary)]">
                    <div>
                        <h2 className="font-semibold">{appConfig?.metadata?.name || "Preview"}</h2>
                        <p className="text-xs text-[var(--text-secondary)]">Live app preview</p>
                    </div>
                    {appConfig && (
                        <Button onClick={handleSave}>
                            Save App
                        </Button>
                    )}
                </header>

                {/* Preview Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    {!appConfig ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-[var(--bg-tertiary)] rounded-xl flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="text-sm text-[var(--text-tertiary)]">
                                Your app preview will appear here
                            </p>
                        </div>
                    ) : (
                        <Card padding="lg" className="max-w-lg mx-auto">
                            {/* App Header */}
                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[var(--border-primary)]">
                                <div className="w-12 h-12 bg-[var(--accent-primary)] rounded-xl flex items-center justify-center text-xl">
                                    {appConfig.metadata.icon || "🤖"}
                                </div>
                                <div>
                                    <h3 className="font-semibold">{appConfig.metadata.name}</h3>
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
                                    <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Output</p>
                                    <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg">
                                        <p className="text-sm text-[var(--text-tertiary)] italic">
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
    );
}
