/**
 * AI Module - Main Exports
 * Central entry point for all AI orchestration functionality
 */

// Provider factory and utilities
export {
    createModel,
    getProvider,
    getAvailableProviders,
    getDefaultModel,
    isValidModel,
} from "./factory";

// Provider types and interfaces
export type {
    AIProvider,
    ModelInfo,
    ProviderConfig,
    LLMProviderType,
} from "./providers";

// Individual providers (for direct access if needed)
export { providers } from "./providers";

// All prompts
export {
    APP_BUILDER_SYSTEM_PROMPT,
    APP_PLANNING_PROMPT,
    CODE_GENERATION_PROMPT,
    APP_REFINEMENT_PROMPT,
} from "./prompts";

// Re-export generation functions (will be updated to use factory)
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject, generateText, streamObject } from "ai";
import { AppConfigSchema, type AppConfig } from "@/schemas/app-config";
import { APP_BUILDER_SYSTEM_PROMPT, APP_REFINEMENT_PROMPT } from "./prompts";
import { createModel } from "./factory";
import type { LLMProviderType } from "./providers";

// Default Google model for fallback when no custom key is provided
function getDefaultGoogleModel() {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
        throw new Error(
            "GOOGLE_GENERATIVE_AI_API_KEY environment variable is required for default AI generation"
        );
    }
    const google = createGoogleGenerativeAI({ apiKey });
    return google("gemini-2.5-flash");
}

interface GenerationOptions {
    provider?: LLMProviderType;
    apiKey?: string;
    baseUrl?: string;
    modelId?: string;
}

/**
 * Generate a new AppConfig from a user's natural language prompt
 * Supports custom provider/API key or falls back to default
 */
export async function generateAppConfig(
    userPrompt: string,
    options?: GenerationOptions
): Promise<AppConfig> {
    // Use custom provider if API key provided, otherwise use default Google
    const model =
        options?.apiKey && options?.provider
            ? createModel(options.provider, options.apiKey, {
                baseUrl: options.baseUrl,
                modelId: options.modelId,
            })
            : getDefaultGoogleModel();

    const { object } = await generateObject({
        model,
        schema: AppConfigSchema,
        system: APP_BUILDER_SYSTEM_PROMPT,
        prompt: userPrompt,
    });

    return object;
}

/**
 * Refine an existing AppConfig based on user feedback
 */
export async function refineAppConfig(
    currentConfig: AppConfig,
    refinement: string,
    options?: GenerationOptions
): Promise<AppConfig> {
    const prompt = APP_REFINEMENT_PROMPT.replace(
        "{{currentConfig}}",
        JSON.stringify(currentConfig, null, 2)
    ).replace("{{refinement}}", refinement);

    const model =
        options?.apiKey && options?.provider
            ? createModel(options.provider, options.apiKey, {
                baseUrl: options.baseUrl,
                modelId: options.modelId,
            })
            : getDefaultGoogleModel();

    const { object } = await generateObject({
        model,
        schema: AppConfigSchema,
        system: APP_BUILDER_SYSTEM_PROMPT,
        prompt,
    });

    return object;
}

/**
 * Stream AppConfig generation for real-time preview
 */
export async function streamAppConfig(
    userPrompt: string,
    options?: GenerationOptions
) {
    const model =
        options?.apiKey && options?.provider
            ? createModel(options.provider, options.apiKey, {
                baseUrl: options.baseUrl,
                modelId: options.modelId,
            })
            : getDefaultGoogleModel();

    return streamObject({
        model,
        schema: AppConfigSchema,
        system: APP_BUILDER_SYSTEM_PROMPT,
        prompt: userPrompt,
    });
}

/**
 * Execute an AI processing block within an app
 */
export async function executeAIBlock(
    systemPrompt: string | undefined,
    userPrompt: string,
    outputFormat: "text" | "json" | "list" | "markdown" = "text",
    options?: GenerationOptions
): Promise<string> {
    const model =
        options?.apiKey && options?.provider
            ? createModel(options.provider, options.apiKey, {
                baseUrl: options.baseUrl,
                modelId: options.modelId,
            })
            : getDefaultGoogleModel();

    const { text } = await generateText({
        model,
        system: systemPrompt || "You are a helpful assistant.",
        prompt: userPrompt,
    });

    return text;
}
