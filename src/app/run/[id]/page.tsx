"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button, Card, Input, GlassButton, DataTable, DataCard } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { AppConfig } from "@/schemas/app-config";

interface App {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    status: "DRAFT" | "ACTIVE" | "ARCHIVED";
    appConfig: AppConfig;
    createdAt: string;
    updatedAt: string;
}

interface OutputData {
    [key: string]: unknown;
}

export default function AppRunPage() {
    const params = useParams();
    const [app, setApp] = useState<App | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [isRunning, setIsRunning] = useState(false);
    const [outputs, setOutputs] = useState<OutputData | null>(null);
    const [executionError, setExecutionError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"controls" | "results">("controls");

    useEffect(() => {
        if (params.id) {
            fetchApp(params.id as string);
        }
    }, [params.id]);

    const fetchApp = async (id: string) => {
        try {
            const res = await fetch(`/api/apps/${id}`);
            if (!res.ok) {
                if (res.status === 404) {
                    setError("App not found");
                } else {
                    setError("Failed to load app");
                }
                return;
            }
            const data = await res.json();
            setApp(data);

            // Initialize form data with default values
            const initialData: Record<string, string> = {};
            data.appConfig?.inputs?.forEach((input: { id: string; defaultValue?: string }) => {
                initialData[input.id] = input.defaultValue || "";
            });
            setFormData(initialData);

            // Auto-run on load to show existing data
            if (data.appConfig?.code) {
                autoRun(data.id);
            }
        } catch {
            setError("Failed to load app");
        } finally {
            setIsLoading(false);
        }
    };

    const autoRun = async (appId: string) => {
        try {
            const res = await fetch(`/api/apps/${appId}/run`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ inputs: {} }),
            });
            if (res.ok) {
                const data = await res.json();
                setOutputs(data.outputs || {});
            }
        } catch (err) {
            console.error("Auto-run failed:", err);
        }
    };

    const handleRun = async () => {
        if (!app) return;
        setIsRunning(true);
        setExecutionError(null);

        try {
            const res = await fetch(`/api/apps/${app.id}/run`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ inputs: formData }),
            });

            const data = await res.json();

            if (!res.ok) {
                setExecutionError(data.error || "Failed to run app");
                return;
            }

            setOutputs(data.outputs || {});
            // Switch to results tab on mobile after running
            setActiveTab("results");
        } catch (err) {
            console.error("Error running app:", err);
            setExecutionError("Failed to run app");
        } finally {
            setIsRunning(false);
        }
    };

    // Render different output types
    const renderOutput = (key: string, value: unknown) => {
        if (value === null || value === undefined) {
            return null;
        }

        // Handle arrays (tables)
        if (Array.isArray(value)) {
            if (value.length === 0) {
                return (
                    <div key={key} className="mb-4 sm:mb-6">
                        <h4 className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] mb-2 sm:mb-3">
                            {key.replace(/([A-Z])/g, " $1")}
                        </h4>
                        <p className="text-xs sm:text-sm text-[var(--text-tertiary)] font-mono">No data yet</p>
                    </div>
                );
            }

            const headers = Object.keys(value[0] || {});
            const columns = headers.map((h) => ({
                key: h,
                header: h.replace(/([A-Z])/g, " $1"),
            }));

            return (
                <div key={key} className="mb-4 sm:mb-6">
                    <h4 className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] mb-2 sm:mb-3">
                        {key.replace(/([A-Z])/g, " $1")}
                    </h4>
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <div className="min-w-[600px] sm:min-w-0 px-4 sm:px-0">
                            <DataTable columns={columns} data={value as Record<string, unknown>[]} />
                        </div>
                    </div>
                </div>
            );
        }

        // Handle objects (cards)
        if (typeof value === "object") {
            return (
                <div key={key} className="mb-4 sm:mb-6">
                    <h4 className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] mb-2 sm:mb-3">
                        {key.replace(/([A-Z])/g, " $1")}
                    </h4>
                    <DataCard data={value as Record<string, unknown>} />
                </div>
            );
        }

        // Handle simple values
        return (
            <div key={key} className="mb-4 sm:mb-6">
                <h4 className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] mb-1 sm:mb-2">
                    {key.replace(/([A-Z])/g, " $1")}
                </h4>
                <p className="text-base sm:text-lg font-medium text-[var(--text-primary)]">
                    {typeof value === "number" ? (
                        <span className="bracket">{value.toLocaleString()}</span>
                    ) : (
                        String(value)
                    )}
                </p>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="h-screen bg-[var(--bg-primary)] dot-grid flex items-center justify-center px-4">
                <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 animate-spin text-[var(--text-tertiary)]" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-[var(--text-tertiary)] font-mono text-sm">Loading app...</span>
                </div>
            </div>
        );
    }

    if (error || !app) {
        return (
            <div className="h-screen bg-[var(--bg-primary)] dot-grid flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 glass rounded-2xl flex items-center justify-center mb-4 sm:mb-6 mx-auto">
                        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-light mb-2">{error || "App not found"}</h3>
                    <p className="text-xs sm:text-sm text-[var(--text-tertiary)] mb-4 sm:mb-6 font-mono">
                        This app may have been deleted or you don&apos;t have access to it.
                    </p>
                    <Link href="/apps">
                        <Button variant="glass">Back to Apps</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const appConfig = app.appConfig;

    return (
        <div className="h-screen bg-[var(--bg-primary)] dot-grid flex flex-col">
            {/* Top Bar - Back Button */}
            <div className="fixed top-4 sm:top-6 left-4 sm:left-6 z-50">
                <Link href="/apps">
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
                        onClick={() => setActiveTab("controls")}
                        className={`flex-1 py-3 text-sm font-mono uppercase tracking-wider transition-colors ${activeTab === "controls"
                                ? "text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]"
                                : "text-[var(--text-tertiary)]"
                            }`}
                    >
                        Controls
                    </button>
                    <button
                        onClick={() => setActiveTab("results")}
                        className={`flex-1 py-3 text-sm font-mono uppercase tracking-wider transition-colors ${activeTab === "results"
                                ? "text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]"
                                : "text-[var(--text-tertiary)]"
                            }`}
                    >
                        Results
                        {outputs && Object.keys(outputs).length > 0 && (
                            <span className="ml-2 w-2 h-2 bg-[var(--accent-success)] rounded-full inline-block" />
                        )}
                    </button>
                </div>
            </div>

            {/* Main Content - Split View on Desktop, Tabbed on Mobile */}
            <div className="flex-1 flex pt-16 sm:pt-20 lg:pt-20">
                {/* Left Panel - App Controls */}
                <div className={`w-full lg:w-1/2 flex flex-col border-r border-[var(--border-primary)] bg-[var(--bg-secondary)] ${activeTab !== "controls" ? "hidden lg:flex" : "flex"
                    } pt-12 lg:pt-0`}>
                    {/* App Header */}
                    <div className="p-4 sm:p-6 border-b border-[var(--border-primary)]">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[var(--accent-primary)]/10 rounded-xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                                {appConfig?.metadata?.icon || app.icon || "🤖"}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h1 className="text-lg sm:text-xl font-medium truncate">{app.name}</h1>
                                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-mono truncate">
                                    {app.description || appConfig?.metadata?.description || "No description"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Input Form - Scrollable */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                        <h2 className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] mb-4 sm:mb-5">
                            {appConfig?.inputs && appConfig.inputs.length > 0 ? "Add New Entry" : "Run App"}
                        </h2>

                        {/* Error message */}
                        {executionError && (
                            <div className="mb-4 sm:mb-5 p-3 sm:p-4 rounded-xl bg-[var(--accent-error)]/10 border border-[var(--accent-error)]/20">
                                <p className="text-xs sm:text-sm text-[var(--accent-error)] font-mono">{executionError}</p>
                            </div>
                        )}

                        {/* Input Fields */}
                        {appConfig?.inputs && appConfig.inputs.length > 0 ? (
                            <div className="space-y-4 sm:space-y-5">
                                {appConfig.inputs.map((input) => {
                                    // Handle select inputs
                                    if (input.type === "select" && input.options) {
                                        return (
                                            <div key={input.id}>
                                                <label className="block text-[11px] sm:text-[12px] font-mono uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                                                    {input.label}{input.required ? " *" : ""}
                                                </label>
                                                <select
                                                    value={formData[input.id] || ""}
                                                    onChange={(e) => setFormData({ ...formData, [input.id]: e.target.value })}
                                                    className={cn(
                                                        "w-full h-11 sm:h-12 px-3 sm:px-4 rounded-xl text-sm",
                                                        "bg-[var(--bg-primary)] border border-[var(--border-primary)]",
                                                        "text-[var(--text-primary)] font-mono",
                                                        "focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/10",
                                                        "transition-all duration-200"
                                                    )}
                                                >
                                                    <option value="">Select...</option>
                                                    {input.options.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        );
                                    }

                                    return (
                                        <Input
                                            key={input.id}
                                            label={`${input.label}${input.required ? " *" : ""}`}
                                            type={input.type === "textarea" ? "text" : (input.type as string)}
                                            placeholder={input.placeholder}
                                            value={formData[input.id] || ""}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                setFormData({ ...formData, [input.id]: e.target.value })
                                            }
                                            helperText={input.helpText}
                                            mono
                                        />
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-xs sm:text-sm text-[var(--text-tertiary)] font-mono">
                                This app has no input fields configured.
                            </p>
                        )}
                    </div>

                    {/* Run Button - Fixed at bottom */}
                    <div className="p-4 sm:p-6 border-t border-[var(--border-primary)]">
                        <Button onClick={handleRun} isLoading={isRunning} fullWidth size="lg">
                            {isRunning ? "Running..." : appConfig?.inputs?.length ? "Submit" : "Run App"}
                        </Button>
                        <div className="flex items-center justify-between mt-3 sm:mt-4 text-[10px] sm:text-[11px] text-[var(--text-tertiary)] font-mono">
                            <span>
                                <span className="bracket">{appConfig?.inputs?.length || 0}</span> inputs
                            </span>
                            <span>Updated {new Date(app.updatedAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Results */}
                <div className={`w-full lg:w-1/2 flex flex-col ${activeTab !== "results" ? "hidden lg:flex" : "flex"
                    } pt-12 lg:pt-0`}>
                    {/* Results Header */}
                    <div className="h-14 sm:h-16 px-4 sm:px-6 flex items-center border-b border-[var(--border-primary)]">
                        <div>
                            <h2 className="font-medium text-sm sm:text-base">Results</h2>
                            <p className="text-[10px] sm:text-[11px] text-[var(--text-tertiary)] font-mono uppercase tracking-wider">
                                Live output
                            </p>
                        </div>
                    </div>

                    {/* Results Content */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 dot-grid">
                        {!outputs || Object.keys(outputs).length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center px-4">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 glass rounded-2xl flex items-center justify-center mb-4 sm:mb-5">
                                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                    </svg>
                                </div>
                                <p className="text-xs sm:text-sm text-[var(--text-tertiary)] font-mono">
                                    Results will appear here
                                </p>
                                <p className="text-[10px] sm:text-xs text-[var(--text-tertiary)] font-mono mt-2 opacity-60">
                                    Submit an entry to see output
                                </p>
                            </div>
                        ) : (
                            <Card padding="lg" className="animate-fadeInUp">
                                {Object.entries(outputs).map(([key, value]) => renderOutput(key, value))}
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
