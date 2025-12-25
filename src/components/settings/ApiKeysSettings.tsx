"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, Card } from "@/components/ui";

interface Provider {
    id: string;
    name: string;
    description: string;
    models: { id: string; name: string; contextLength?: number; default?: boolean }[];
}

interface ApiKey {
    id: string;
    provider: string;
    maskedKey: string;
    baseUrl: string | null;
    label: string | null;
    isActive: boolean;
    isDefault: boolean;
}

interface AddKeyModalProps {
    providers: Provider[];
    existingKeys: string[];
    onClose: () => void;
    onSave: (data: { provider: string; apiKey: string; baseUrl?: string; label?: string }) => Promise<void>;
}

function AddKeyModal({ providers, existingKeys, onClose, onSave }: AddKeyModalProps) {
    const [provider, setProvider] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [baseUrl, setBaseUrl] = useState("");
    const [label, setLabel] = useState("");
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [saving, setSaving] = useState(false);

    const availableProviders = providers.filter((p) => !existingKeys.includes(p.id));
    const selectedProvider = providers.find((p) => p.id === provider);

    const handleTest = async () => {
        if (!provider || !apiKey) return;

        setTesting(true);
        setTestResult(null);

        try {
            const res = await fetch("/api/settings/api-keys/test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    provider,
                    apiKey,
                    baseUrl: baseUrl || undefined,
                }),
            });

            const data = await res.json();
            setTestResult({
                success: data.success,
                message: data.success ? data.message : data.error,
            });
        } catch {
            setTestResult({ success: false, message: "Failed to test connection" });
        } finally {
            setTesting(false);
        }
    };

    const handleSave = async () => {
        if (!provider || !apiKey) return;

        setSaving(true);
        try {
            await onSave({
                provider,
                apiKey,
                baseUrl: baseUrl || undefined,
                label: label || undefined,
            });
            onClose();
        } catch {
            setTestResult({ success: false, message: "Failed to save API key" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--bg-secondary)] rounded-xl w-full max-w-md p-6 space-y-4">
                <h3 className="text-lg font-semibold">Add API Key</h3>

                {/* Provider Select */}
                <div>
                    <label className="block text-sm font-medium mb-1">Provider</label>
                    <select
                        className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg"
                        value={provider}
                        onChange={(e) => {
                            setProvider(e.target.value);
                            setTestResult(null);
                        }}
                    >
                        <option value="">Select a provider...</option>
                        {availableProviders.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                    {selectedProvider && (
                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                            {selectedProvider.description}
                        </p>
                    )}
                </div>

                {/* API Key */}
                <div>
                    <label className="block text-sm font-medium mb-1">API Key</label>
                    <input
                        type="password"
                        className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg"
                        placeholder="sk-..."
                        value={apiKey}
                        onChange={(e) => {
                            setApiKey(e.target.value);
                            setTestResult(null);
                        }}
                    />
                </div>

                {/* Base URL (optional) */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Base URL <span className="text-[var(--text-secondary)]">(optional)</span>
                    </label>
                    <input
                        type="url"
                        className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg"
                        placeholder="https://api.example.com/v1"
                        value={baseUrl}
                        onChange={(e) => setBaseUrl(e.target.value)}
                    />
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                        For Azure, self-hosted, or proxy endpoints
                    </p>
                </div>

                {/* Label (optional) */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Label <span className="text-[var(--text-secondary)]">(optional)</span>
                    </label>
                    <input
                        type="text"
                        className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg"
                        placeholder="My OpenAI Key"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                    />
                </div>

                {/* Test Result */}
                {testResult && (
                    <div
                        className={`p-3 rounded-lg text-sm ${testResult.success
                                ? "bg-green-500/10 text-green-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                    >
                        {testResult.message}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <Button
                        variant="secondary"
                        onClick={handleTest}
                        disabled={!provider || !apiKey || testing}
                        className="flex-1"
                    >
                        {testing ? "Testing..." : "Test Connection"}
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!provider || !apiKey || saving}
                        className="flex-1"
                    >
                        {saving ? "Saving..." : "Save"}
                    </Button>
                </div>

                <Button variant="ghost" onClick={onClose} className="w-full">
                    Cancel
                </Button>
            </div>
        </div>
    );
}

export default function ApiKeysSettings() {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchProviders = useCallback(async () => {
        try {
            const res = await fetch("/api/settings/providers");
            const data = await res.json();
            setProviders(data.providers || []);
        } catch (error) {
            console.error("Failed to fetch providers:", error);
        }
    }, []);

    const fetchApiKeys = useCallback(async () => {
        try {
            const res = await fetch("/api/settings/api-keys");
            const data = await res.json();
            setApiKeys(data.apiKeys || []);
        } catch (error) {
            console.error("Failed to fetch API keys:", error);
        }
    }, []);

    useEffect(() => {
        Promise.all([fetchProviders(), fetchApiKeys()]).finally(() => setLoading(false));
    }, [fetchProviders, fetchApiKeys]);

    const handleAddKey = async (data: {
        provider: string;
        apiKey: string;
        baseUrl?: string;
        label?: string;
    }) => {
        const res = await fetch("/api/settings/api-keys", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error);
        }

        await fetchApiKeys();
    };

    const handleDeleteKey = async (id: string) => {
        if (!confirm("Are you sure you want to delete this API key?")) return;

        setDeleting(id);
        try {
            const res = await fetch(`/api/settings/api-keys?id=${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                await fetchApiKeys();
            }
        } catch (error) {
            console.error("Failed to delete API key:", error);
        } finally {
            setDeleting(null);
        }
    };

    const getProviderInfo = (providerId: string) => {
        return providers.find((p) => p.id === providerId);
    };

    if (loading) {
        return (
            <Card padding="md">
                <h2 className="font-semibold mb-4">🔑 API Keys</h2>
                <div className="text-sm text-[var(--text-secondary)]">Loading...</div>
            </Card>
        );
    }

    const configuredProviderIds = apiKeys.map((k) => k.provider);

    return (
        <>
            <Card padding="md">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="font-semibold">🔑 API Keys</h2>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                            Add your own LLM API keys
                        </p>
                    </div>
                    <Button
                        size="sm"
                        onClick={() => setShowAddModal(true)}
                        disabled={configuredProviderIds.length >= providers.length}
                    >
                        + Add Key
                    </Button>
                </div>

                {apiKeys.length === 0 ? (
                    <div className="text-center py-6 text-sm text-[var(--text-secondary)]">
                        <p>No API keys configured</p>
                        <p className="text-xs mt-1">
                            Add your own keys to use different AI providers
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {apiKeys.map((key) => {
                            const providerInfo = getProviderInfo(key.provider);
                            return (
                                <div
                                    key={key.id}
                                    className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-lg"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm">
                                                {providerInfo?.name || key.provider}
                                            </span>
                                            {key.isActive && (
                                                <span className="text-[10px] px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded">
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                                            {key.label || key.maskedKey}
                                        </div>
                                        {key.baseUrl && (
                                            <div className="text-xs text-[var(--text-secondary)] mt-0.5 truncate max-w-48">
                                                {key.baseUrl}
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteKey(key.id)}
                                        disabled={deleting === key.id}
                                        className="text-red-400 hover:text-red-300"
                                    >
                                        {deleting === key.id ? "..." : "Delete"}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>

            {showAddModal && (
                <AddKeyModal
                    providers={providers}
                    existingKeys={configuredProviderIds}
                    onClose={() => setShowAddModal(false)}
                    onSave={handleAddKey}
                />
            )}
        </>
    );
}
