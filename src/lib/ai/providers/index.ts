/**
 * AI Providers Index
 * Re-exports all providers and provides a registry
 */

export * from "./base";
export { googleProvider } from "./google";
export { openaiProvider } from "./openai";
export { anthropicProvider } from "./anthropic";
export { mistralProvider } from "./mistral";
export { groqProvider } from "./groq";
export { deepseekProvider } from "./deepseek";

import { googleProvider } from "./google";
import { openaiProvider } from "./openai";
import { anthropicProvider } from "./anthropic";
import { mistralProvider } from "./mistral";
import { groqProvider } from "./groq";
import { deepseekProvider } from "./deepseek";
import type { AIProvider, LLMProviderType } from "./base";

/**
 * Registry of all available providers
 */
export const providers: Record<LLMProviderType, AIProvider> = {
    GOOGLE: googleProvider,
    OPENAI: openaiProvider,
    ANTHROPIC: anthropicProvider,
    MISTRAL: mistralProvider,
    GROQ: groqProvider,
    DEEPSEEK: deepseekProvider,
} as const;
