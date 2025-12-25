/**
 * Base interface for AI providers
 * All provider implementations must follow this interface
 */

// Use a generic type that accepts any language model version
// This is necessary because different provider packages may use different versions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyLanguageModel = any;

/**
 * Model information with capabilities
 */
export interface ModelInfo {
    id: string;
    name: string;
    contextLength?: number;
    supportsTools?: boolean;
    supportsVision?: boolean;
    default?: boolean;
}

/**
 * Configuration for creating a model instance
 */
export interface ProviderConfig {
    apiKey: string;
    baseUrl?: string;
    modelId?: string;
}

/**
 * Provider interface that all AI providers must implement
 */
export interface AIProvider {
    /** Unique provider ID (matches LLMProvider enum) */
    id: string;
    /** Display name for the provider */
    name: string;
    /** Short description of the provider */
    description: string;
    /** Whether this provider requires a base URL */
    requiresBaseUrl?: boolean;
    /** Default base URL if applicable */
    defaultBaseUrl?: string;
    /** Available models for this provider */
    models: ModelInfo[];
    /** Create a language model instance with the given config */
    createModel(config: ProviderConfig): AnyLanguageModel;
}

/**
 * Type for provider IDs
 */
export type LLMProviderType = "GOOGLE" | "OPENAI" | "ANTHROPIC" | "MISTRAL" | "GROQ" | "DEEPSEEK";
