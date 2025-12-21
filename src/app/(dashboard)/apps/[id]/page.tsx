"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, Input } from "@/components/ui";
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

export default function AppDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [app, setApp] = useState<App | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [isRunning, setIsRunning] = useState(false);
    const [outputs, setOutputs] = useState<OutputData | null>(null);
    const [executionError, setExecutionError] = useState<string | null>(null);

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

            // Clear form after successful submission (optional)
            // setFormData({});
        } catch (err) {
            console.error("Error running app:", err);
            setExecutionError("Failed to run app");
        } finally {
            setIsRunning(false);
        }
    };

    const handleActivate = async () => {
        if (!app) return;
        try {
            const res = await fetch(`/api/apps/${app.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "ACTIVE" }),
            });
            if (res.ok) {
                setApp({ ...app, status: "ACTIVE" });
            }
        } catch (err) {
            console.error("Failed to activate app:", err);
        }
    };

    const handleDelete = async () => {
        if (!app || !confirm("Are you sure you want to delete this app?")) return;
        try {
            const res = await fetch(`/api/apps/${app.id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                router.push("/apps");
            }
        } catch (err) {
            console.error("Failed to delete app:", err);
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
                    <div key={key} className="mb-4">
                        <h4 className="text-sm font-medium mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                        <p className="text-sm text-[var(--text-tertiary)]">No data yet</p>
                    </div>
                );
            }

            // Render as table
            const headers = Object.keys(value[0] || {});
            return (
                <div key={key} className="mb-4">
                    <h4 className="text-sm font-medium mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[var(--border-primary)]">
                                    {headers.map((h) => (
                                        <th key={h} className="text-left py-2 px-3 font-medium capitalize">
                                            {h.replace(/([A-Z])/g, ' $1')}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {value.map((row, i) => (
                                    <tr key={i} className="border-b border-[var(--border-primary)]/50">
                                        {headers.map((h) => (
                                            <td key={h} className="py-2 px-3">
                                                {typeof row[h] === 'object'
                                                    ? JSON.stringify(row[h])
                                                    : String(row[h] ?? '')}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        // Handle objects (cards)
        if (typeof value === 'object') {
            return (
                <div key={key} className="mb-4">
                    <h4 className="text-sm font-medium mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                    <div className="p-3 bg-[var(--bg-secondary)] rounded-lg">
                        {Object.entries(value).map(([k, v]) => (
                            <div key={k} className="flex justify-between py-1">
                                <span className="text-[var(--text-secondary)] capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                                <span className="font-medium">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // Handle simple values
        return (
            <div key={key} className="mb-4">
                <h4 className="text-sm font-medium mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                <p className="text-[var(--text-secondary)]">{String(value)}</p>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="p-8 max-w-4xl">
                <div className="h-8 w-48 bg-[var(--bg-tertiary)] rounded animate-pulse mb-4" />
                <div className="h-64 bg-[var(--bg-tertiary)] rounded-xl animate-pulse" />
            </div>
        );
    }

    if (error || !app) {
        return (
            <div className="p-8 max-w-4xl">
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-16 h-16 bg-[var(--bg-tertiary)] rounded-xl flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{error || "App not found"}</h3>
                    <p className="text-sm text-[var(--text-tertiary)] mb-4">
                        This app may have been deleted or you don&apos;t have access to it.
                    </p>
                    <Link href="/apps">
                        <Button variant="secondary">Back to Apps</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const appConfig = app.appConfig;

    return (
        <div className="p-8 max-w-4xl">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[var(--accent-primary)] rounded-xl flex items-center justify-center text-2xl">
                        {appConfig?.metadata?.icon || app.icon || "🤖"}
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold">{app.name}</h1>
                            <span
                                className={`px-2 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-wide ${app.status === "ACTIVE"
                                    ? "bg-[var(--accent-success)]/10 text-[var(--accent-success)]"
                                    : app.status === "DRAFT"
                                        ? "bg-[var(--accent-warning)]/10 text-[var(--accent-warning)]"
                                        : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
                                    }`}
                            >
                                {app.status}
                            </span>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                            {app.description || appConfig?.metadata?.description || "No description"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {app.status === "DRAFT" && (
                        <Button variant="secondary" onClick={handleActivate}>
                            Activate
                        </Button>
                    )}
                    <Button variant="ghost" onClick={handleDelete}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </Button>
                </div>
            </div>

            {/* Output Section - Show first if there's data */}
            {outputs && Object.keys(outputs).length > 0 && (
                <Card padding="lg" className="mb-6">
                    <h2 className="font-semibold mb-4">Results</h2>
                    <div className="space-y-2">
                        {Object.entries(outputs).map(([key, value]) => renderOutput(key, value))}
                    </div>
                </Card>
            )}

            {/* App Runner - Input form */}
            <Card padding="lg" className="mb-6">
                <h2 className="font-semibold mb-4">
                    {appConfig?.inputs && appConfig.inputs.length > 0 ? "Add New Entry" : "Run App"}
                </h2>

                {/* Error message */}
                {executionError && (
                    <div className="mb-4 p-3 bg-[var(--accent-error)]/10 text-[var(--accent-error)] rounded-lg text-sm">
                        {executionError}
                    </div>
                )}

                {/* Input Fields */}
                {appConfig?.inputs && appConfig.inputs.length > 0 ? (
                    <div className="space-y-4 mb-6">
                        {appConfig.inputs.map((input) => {
                            // Handle select inputs
                            if (input.type === "select" && input.options) {
                                return (
                                    <div key={input.id}>
                                        <label className="block text-sm font-medium mb-1.5">
                                            {input.label}{input.required ? " *" : ""}
                                        </label>
                                        <select
                                            value={formData[input.id] || ""}
                                            onChange={(e) => setFormData({ ...formData, [input.id]: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
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
                                />
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-[var(--text-tertiary)] mb-6">
                        This app has no input fields configured.
                    </p>
                )}

                <Button onClick={handleRun} isLoading={isRunning} fullWidth size="lg">
                    {isRunning ? "Running..." : appConfig?.inputs?.length ? "Submit" : "Run App"}
                </Button>
            </Card>

            {/* App Info */}
            <Card padding="md">
                <h2 className="font-semibold mb-4">App Info</h2>
                <div className="text-xs text-[var(--text-tertiary)] space-y-2">
                    <p><strong>Inputs:</strong> {appConfig?.inputs?.length || 0} field(s)</p>
                    <p><strong>Has Code:</strong> {appConfig?.code ? "Yes" : "No"}</p>
                    <p><strong>Created:</strong> {new Date(app.createdAt).toLocaleString()}</p>
                    <p><strong>Updated:</strong> {new Date(app.updatedAt).toLocaleString()}</p>
                </div>
            </Card>

            {/* Back Link */}
            <div className="mt-6">
                <Link href="/apps" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                    ← Back to Apps
                </Link>
            </div>
        </div>
    );
}
