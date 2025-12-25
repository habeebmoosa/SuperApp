/**
 * OpenAI Provider
 */

import { createOpenAI } from "@ai-sdk/openai";
import type { AIProvider, ProviderConfig } from "./base";

export const openaiProvider: AIProvider = {
    id: "OPENAI",
    name: "OpenAI",
    description: "OpenAI GPT models including GPT-4o and o1",
    defaultBaseUrl: "https://api.openai.com/v1",
    models: [
        {
            id: "openai/gpt-4o",
            name: "GPT-4o",
            contextLength: 128000,
            supportsTools: true,
            supportsVision: true,
            default: true,
        },
        {
            id: "openai/gpt-4o-mini",
            name: "GPT-4o Mini",
            contextLength: 128000,
            supportsTools: true,
            supportsVision: true,
        },
        {
            id: "openai/gpt-4-turbo",
            name: "GPT-4 Turbo",
            contextLength: 128000,
            supportsTools: true,
            supportsVision: true,
        },
        {
            id: "openai/o1",
            name: "o1",
            contextLength: 200000,
            supportsTools: false,
            supportsVision: true,
        },
        {
            id: "openai/o1-mini",
            name: "o1 Mini",
            contextLength: 128000,
            supportsTools: false,
            supportsVision: false,
        },
        {
            id: "openai/o3-mini",
            name: "o3 Mini",
            contextLength: 200000,
            supportsTools: false,
            supportsVision: false,
        },
    ],
    createModel({ apiKey, baseUrl, modelId }) {
        const openai = createOpenAI({
            apiKey,
            baseURL: baseUrl || "https://api.openai.com/v1",
        });
        // Use .chat() for chat completions API (compatible with structured outputs)
        return openai.chat(modelId || "openai/gpt-4o");
    },
};

