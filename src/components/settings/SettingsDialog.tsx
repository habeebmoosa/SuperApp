"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Button } from "@/components/ui";

// Types
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

type SettingsTab = "account" | "api-keys" | "appearance" | "data";

interface SettingsDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

// Tab configuration
const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    {
        id: "account",
        label: "Account",
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
        ),
    },
    {
        id: "api-keys",
        label: "API Keys",
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
        ),
    },
    {
        id: "appearance",
        label: "Appearance",
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
            </svg>
        ),
    },
    {
        id: "data",
        label: "Data Controls",
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
            </svg>
        ),
    },
];

// ============================================
// Account Tab Content
// ============================================
function AccountTab() {
    const { data: session } = useSession();

    return (
        <div className="space-y-6">
            {/* Profile Section */}
            <div>
                <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-4">Profile</h3>
                <div className="flex items-center gap-4 p-4 bg-[var(--bg-tertiary)] rounded-xl">
                    <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center border border-[var(--border-primary)]">
                        <span className="text-2xl font-medium text-[var(--text-secondary)]">
                            {session?.user?.name?.[0] || session?.user?.email?.[0] || "U"}
                        </span>
                    </div>
                    <div className="flex-1">
                        <p className="font-medium text-[var(--text-primary)]">
                            {session?.user?.name || "User"}
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                            {session?.user?.email}
                        </p>
                    </div>
                    <Button variant="secondary" size="sm" disabled>
                        Edit
                    </Button>
                </div>
            </div>

            {/* Account Details */}
            <div>
                <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-4">Account</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] rounded-xl">
                        <div>
                            <p className="text-sm font-medium">Email</p>
                            <p className="text-sm text-[var(--text-secondary)]">{session?.user?.email}</p>
                        </div>
                        <Button variant="secondary" size="sm" disabled>
                            Change
                        </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] rounded-xl">
                        <div>
                            <p className="text-sm font-medium">Password</p>
                            <p className="text-sm text-[var(--text-secondary)]">••••••••</p>
                        </div>
                        <Button variant="secondary" size="sm" disabled>
                            Change
                        </Button>
                    </div>
                </div>
            </div>

            {/* Sign Out */}
            <div className="pt-4 border-t border-[var(--border-primary)]">
                <Button
                    variant="danger"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full"
                >
                    Sign Out
                </Button>
            </div>
        </div>
    );
}

// ============================================
// API Keys Tab Content
// ============================================
function ApiKeysTab() {
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
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-6 h-6 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full" />
            </div>
        );
    }

    const configuredProviderIds = apiKeys.map((k) => k.provider);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">API Keys</h3>
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">Add your own LLM provider API keys</p>
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
                <div className="text-center py-8 text-sm text-[var(--text-secondary)] bg-[var(--bg-tertiary)] rounded-xl">
                    <p>No API keys configured</p>
                    <p className="text-xs mt-1 text-[var(--text-tertiary)]">
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
                                className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] rounded-xl"
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

            {/* Add Key Modal */}
            {showAddModal && (
                <AddKeyModal
                    providers={providers}
                    existingKeys={configuredProviderIds}
                    onClose={() => setShowAddModal(false)}
                    onSave={handleAddKey}
                />
            )}
        </div>
    );
}

// Add Key Modal Component
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div 
                className="bg-[var(--bg-secondary)] rounded-xl w-full max-w-md p-6 space-y-4 animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-semibold">Add API Key</h3>

                {/* Provider Select */}
                <div>
                    <label className="block text-sm font-medium mb-1">Provider</label>
                    <select
                        className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
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
                        className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
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
                        className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
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
                        className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
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

// ============================================
// Appearance Tab Content
// ============================================
function AppearanceTab() {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-4">Theme</h3>
                <div className="space-y-3">
                    {/* Dark Theme Option */}
                    <button
                        onClick={() => theme === "light" && toggleTheme()}
                        className={cn(
                            "w-full flex items-center gap-4 p-4 rounded-xl border transition-all",
                            theme === "dark"
                                ? "bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]"
                                : "bg-[var(--bg-tertiary)] border-[var(--border-primary)] hover:border-[var(--border-secondary)]"
                        )}
                    >
                        <div className="w-12 h-12 bg-[#0a0a0a] rounded-xl flex items-center justify-center border border-white/10">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        </div>
                        <div className="flex-1 text-left">
                            <p className="font-medium">Dark</p>
                            <p className="text-sm text-[var(--text-secondary)]">True black theme</p>
                        </div>
                        {theme === "dark" && (
                            <svg className="w-5 h-5 text-[var(--accent-primary)]" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                    </button>

                    {/* Light Theme Option */}
                    <button
                        onClick={() => theme === "dark" && toggleTheme()}
                        className={cn(
                            "w-full flex items-center gap-4 p-4 rounded-xl border transition-all",
                            theme === "light"
                                ? "bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]"
                                : "bg-[var(--bg-tertiary)] border-[var(--border-primary)] hover:border-[var(--border-secondary)]"
                        )}
                    >
                        <div className="w-12 h-12 bg-[#f2f2f2] rounded-xl flex items-center justify-center border border-black/10">
                            <svg className="w-6 h-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div className="flex-1 text-left">
                            <p className="font-medium">Light</p>
                            <p className="text-sm text-[var(--text-secondary)]">Clean minimal theme</p>
                        </div>
                        {theme === "light" && (
                            <svg className="w-5 h-5 text-[var(--accent-primary)]" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Accent Color (Placeholder) */}
            <div>
                <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-4">Accent Color</h3>
                <div className="flex gap-3">
                    {["#facc15", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"].map((color) => (
                        <button
                            key={color}
                            className={cn(
                                "w-10 h-10 rounded-full transition-all",
                                color === "#facc15" && "ring-2 ring-offset-2 ring-offset-[var(--bg-secondary)] ring-[var(--accent-primary)]"
                            )}
                            style={{ backgroundColor: color }}
                            disabled
                            title="Coming soon"
                        />
                    ))}
                </div>
                <p className="text-xs text-[var(--text-tertiary)] mt-2">Custom accent colors coming soon</p>
            </div>
        </div>
    );
}

// ============================================
// Data Controls Tab Content
// ============================================
function DataControlsTab() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-4">Data Management</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] rounded-xl">
                        <div>
                            <p className="text-sm font-medium">Export Data</p>
                            <p className="text-xs text-[var(--text-secondary)]">Download all your apps and data</p>
                        </div>
                        <Button variant="secondary" size="sm" disabled>
                            Export
                        </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] rounded-xl">
                        <div>
                            <p className="text-sm font-medium">Clear Conversations</p>
                            <p className="text-xs text-[var(--text-secondary)]">Delete all chat history</p>
                        </div>
                        <Button variant="secondary" size="sm" disabled>
                            Clear
                        </Button>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-4 border-t border-[var(--border-primary)]">
                <h3 className="text-sm font-medium text-[var(--accent-error)] uppercase tracking-wider mb-4">Danger Zone</h3>
                <div className="p-4 bg-[var(--accent-error)]/10 border border-[var(--accent-error)]/30 rounded-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-[var(--accent-error)]">Delete Account</p>
                            <p className="text-xs text-[var(--text-secondary)]">Permanently delete your account and all data</p>
                        </div>
                        <Button variant="danger" size="sm" disabled>
                            Delete
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================
// Main Settings Dialog Component
// ============================================
export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
    const [activeTab, setActiveTab] = useState<SettingsTab>("account");

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEsc);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const renderTabContent = () => {
        switch (activeTab) {
            case "account":
                return <AccountTab />;
            case "api-keys":
                return <ApiKeysTab />;
            case "appearance":
                return <AppearanceTab />;
            case "data":
                return <DataControlsTab />;
            default:
                return null;
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="bg-[var(--bg-secondary)] rounded-2xl w-full max-w-[720px] h-[520px] max-h-[90vh] flex overflow-hidden shadow-2xl border border-[var(--border-primary)] animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Left Sidebar - Tab Navigation */}
                <div className="w-52 bg-[var(--bg-tertiary)] border-r border-[var(--border-primary)] flex flex-col">
                    {/* Header */}
                    <div className="p-4.5 border-b border-[var(--border-primary)]">
                        <h2 className="text-lg font-semibold">Settings</h2>
                    </div>

                    {/* Tabs */}
                    <nav className="flex-1 p-3 space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                                    activeTab === tab.id
                                        ? "bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]"
                                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                                )}
                            >
                                {tab.icon}
                                <span className="font-medium">{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Right Content */}
                <div className="flex-1 flex flex-col">
                    {/* Header with close button */}
                    <div className="flex items-center justify-between p-5 border-b border-[var(--border-primary)]">
                        <h3 className="text-lg font-medium capitalize">
                            {tabs.find((t) => t.id === activeTab)?.label || "Settings"}
                        </h3>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto p-5">
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SettingsDialog;
