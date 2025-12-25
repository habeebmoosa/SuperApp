/**
 * AI Provider Factory
 * Dynamic provider instantiation based on user configuration
 */

import { providers, type AIProvider, type LLMProviderType } from "./providers";
import type { LanguageModel } from "ai";

/**
 * Get a provider by its ID
 */
export function getProvider(providerId: LLMProviderType): AIProvider {
    const provider = providers[providerId];
    if (!provider) {
        throw new Error(`Unknown provider: ${providerId}`);
    }
    return provider;
}

/**
 * Create a model instance for a given provider
 */
export function createModel(
    providerId: LLMProviderType,
    apiKey: string,
    options?: {
        baseUrl?: string;
        modelId?: string;
    }
): LanguageModel {
    const provider = getProvider(providerId);
    return provider.createModel({
        apiKey,
        baseUrl: options?.baseUrl,
        modelId: options?.modelId,
    });
}

/**
 * Get list of all available providers with their info
 */
export function getAvailableProviders() {
    return Object.values(providers).map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        requiresBaseUrl: p.requiresBaseUrl,
        defaultBaseUrl: p.defaultBaseUrl,
        models: p.models,
    }));
}

/**
 * Get the default model for a provider
 */
export function getDefaultModel(providerId: LLMProviderType): string {
    const provider = getProvider(providerId);
    const defaultModel = provider.models.find((m) => m.default);
    return defaultModel?.id || provider.models[0]?.id || "";
}

/**
 * Validate if a model ID is valid for a provider
 */
export function isValidModel(providerId: LLMProviderType, modelId: string): boolean {
    const provider = getProvider(providerId);
    return provider.models.some((m) => m.id === modelId);
}
