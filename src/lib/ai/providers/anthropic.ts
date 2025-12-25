/**
 * Anthropic Claude Provider
 */

import { createAnthropic } from "@ai-sdk/anthropic";
import type { AIProvider, ProviderConfig } from "./base";

export const anthropicProvider: AIProvider = {
    id: "ANTHROPIC",
    name: "Anthropic Claude",
    description: "Anthropic's Claude models known for safety and helpfulness",
    models: [
        {
            id: "claude-sonnet-4-20250514",
            name: "Claude Sonnet 4",
            contextLength: 200000,
            supportsTools: true,
            supportsVision: true,
            default: true,
        },
        {
            id: "claude-3-5-sonnet-20241022",
            name: "Claude 3.5 Sonnet",
            contextLength: 200000,
            supportsTools: true,
            supportsVision: true,
        },
        {
            id: "claude-3-5-haiku-20241022",
            name: "Claude 3.5 Haiku",
            contextLength: 200000,
            supportsTools: true,
            supportsVision: true,
        },
        {
            id: "claude-3-opus-20240229",
            name: "Claude 3 Opus",
            contextLength: 200000,
            supportsTools: true,
            supportsVision: true,
        },
    ],
    createModel({ apiKey, baseUrl, modelId }) {
        const anthropic = createAnthropic({
            apiKey,
            baseURL: baseUrl,
        });
        return anthropic(modelId || "claude-sonnet-4-20250514");
    },
};
