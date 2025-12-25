"use client";

import { useState, useEffect, useCallback } from "react";

interface Model {
    id: string;
    name: string;
    contextLength?: number;
    supportsTools?: boolean;
    supportsVision?: boolean;
    default?: boolean;
}

interface Provider {
    id: string;
    name: string;
    description: string;
    models: Model[];
}

interface ApiKey {
    id: string;
    provider: string;
    maskedKey: string;
    isActive: boolean;
}

interface ModelSelection {
    provider: string;
    modelId: string;
}

interface ModelSelectorProps {
    onSelectionChange: (selection: ModelSelection | null) => void;
    disabled?: boolean;
}

export default function ModelSelector({ onSelectionChange, disabled }: ModelSelectorProps) {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [userKeys, setUserKeys] = useState<ApiKey[]>([]);
    const [selectedProvider, setSelectedProvider] = useState<string>("");
    const [selectedModel, setSelectedModel] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    // Fetch providers and user's API keys
    const fetchData = useCallback(async () => {
        try {
            const [providersRes, keysRes] = await Promise.all([
                fetch("/api/settings/providers"),
                fetch("/api/settings/api-keys"),
            ]);

            const providersData = await providersRes.json();
            const keysData = await keysRes.json();

            setProviders(providersData.providers || []);
            setUserKeys(keysData.apiKeys || []);

            // Auto-select first available provider and its default model
            const activeProviderIds = (keysData.apiKeys || [])
                .filter((k: ApiKey) => k.isActive)
                .map((k: ApiKey) => k.provider);

            if (activeProviderIds.length > 0 && providersData.providers) {
                const firstProvider = providersData.providers.find(
                    (p: Provider) => activeProviderIds.includes(p.id)
                );
                if (firstProvider) {
                    setSelectedProvider(firstProvider.id);
                    const defaultModel = firstProvider.models.find((m: Model) => m.default);
                    setSelectedModel(defaultModel?.id || firstProvider.models[0]?.id || "");
                }
            }
        } catch (error) {
            console.error("Failed to fetch model data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Notify parent of selection changes
    useEffect(() => {
        if (selectedProvider && selectedModel) {
            onSelectionChange({ provider: selectedProvider, modelId: selectedModel });
        } else {
            onSelectionChange(null);
        }
    }, [selectedProvider, selectedModel, onSelectionChange]);

    // Get providers that user has active keys for
    const activeProviderIds = userKeys.filter((k) => k.isActive).map((k) => k.provider);
    const availableProviders = providers.filter((p) => activeProviderIds.includes(p.id));

    const currentProvider = providers.find((p) => p.id === selectedProvider);
    const currentModel = currentProvider?.models.find((m) => m.id === selectedModel);

    if (loading) {
        return (
            <div className="glass px-3 py-2 rounded-lg text-xs text-[var(--text-tertiary)] font-mono">
                Loading models...
            </div>
        );
    }

    if (availableProviders.length === 0) {
        return (
            <a
                href="/settings"
                className="glass px-3 py-2 rounded-lg text-xs text-[var(--text-tertiary)] font-mono hover:text-[var(--text-primary)] transition-colors"
            >
                + Add API Key
            </a>
        );
    }

    return (
        <div className="relative">
            {/* Selector Button */}
            <button
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className="glass px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-mono hover:bg-white/10 transition-colors disabled:opacity-50"
            >
                <span className="text-[var(--text-tertiary)]">Model:</span>
                <span className="text-[var(--text-primary)]">
                    {currentModel?.name || "Select"}
                </span>
                <svg
                    className={`w-3 h-3 text-[var(--text-tertiary)] transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu */}
                    <div className="absolute top-full left-0 mt-2 w-64 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl shadow-xl z-50 overflow-hidden">
                        {availableProviders.map((provider) => (
                            <div key={provider.id}>
                                <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] bg-[var(--bg-tertiary)]">
                                    {provider.name}
                                </div>
                                {provider.models.map((model) => (
                                    <button
                                        key={model.id}
                                        onClick={() => {
                                            setSelectedProvider(provider.id);
                                            setSelectedModel(model.id);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between hover:bg-[var(--bg-tertiary)] transition-colors ${selectedProvider === provider.id && selectedModel === model.id
                                                ? "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]"
                                                : ""
                                            }`}
                                    >
                                        <span>{model.name}</span>
                                        <span className="text-[10px] text-[var(--text-tertiary)]">
                                            {model.contextLength
                                                ? `${Math.round(model.contextLength / 1000)}K`
                                                : ""}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
