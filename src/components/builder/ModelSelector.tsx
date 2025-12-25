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
            <div className="h-10 px-3 rounded-full bg-[var(--bg-tertiary)] flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
                <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="hidden sm:inline">Loading...</span>
            </div>
        );
    }

    if (availableProviders.length === 0) {
        return (
            <a
                href="/settings"
                className="h-10 px-4 rounded-full bg-[var(--bg-tertiary)] flex items-center gap-2 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="hidden sm:inline">Add API Key</span>
            </a>
        );
    }

    return (
        <div className="relative">
            {/* Selector Button - Grok Style */}
            <button
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className="h-10 px-4 rounded-full bg-[var(--bg-tertiary)] flex items-center gap-2 text-sm hover:bg-[var(--bg-secondary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {/* Model Icon */}
                <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                </svg>
                <span className="text-[var(--text-primary)] max-w-[100px] truncate hidden sm:inline">
                    {currentModel?.name || "Select"}
                </span>
                {/* Up/Down Arrow */}
                <svg
                    className={`w-3 h-3 text-[var(--text-tertiary)] transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
            </button>

            {/* Dropdown - Opens Upward */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu - Positioned Above */}
                    <div className="absolute bottom-full right-0 mb-2 w-72 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl shadow-2xl shadow-black/20 z-50 overflow-hidden">
                        {/* Menu Content */}
                        <div className="max-h-80 overflow-y-auto">
                            {availableProviders.map((provider) => (
                                <div key={provider.id}>
                                    {/* Provider Header */}
                                    <div className="px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] bg-[var(--bg-secondary)] border-b border-[var(--border-primary)]">
                                        {provider.name}
                                    </div>
                                    {/* Models */}
                                    {provider.models.map((model) => (
                                        <button
                                            key={model.id}
                                            onClick={() => {
                                                setSelectedProvider(provider.id);
                                                setSelectedModel(model.id);
                                                setIsOpen(false);
                                            }}
                                            className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-[var(--bg-secondary)] transition-colors ${selectedProvider === provider.id && selectedModel === model.id
                                                    ? "bg-[var(--accent-primary)]/5"
                                                    : ""
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {/* Model Icon */}
                                                <div className="w-8 h-8 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-[var(--text-primary)] font-medium">{model.name}</div>
                                                    {model.contextLength && (
                                                        <div className="text-[10px] text-[var(--text-tertiary)]">
                                                            {Math.round(model.contextLength / 1000)}K context
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Checkmark for selected */}
                                            {selectedProvider === provider.id && selectedModel === model.id && (
                                                <svg className="w-5 h-5 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                </svg>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
