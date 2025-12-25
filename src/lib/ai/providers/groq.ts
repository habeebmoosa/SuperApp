/**
 * Groq Provider
 * Fast inference for open-source models
 */

import { createGroq } from "@ai-sdk/groq";
import type { AIProvider, ProviderConfig } from "./base";

export const groqProvider: AIProvider = {
    id: "GROQ",
    name: "Groq",
    description: "Ultra-fast inference for open-source models",
    models: [
        {
            id: "llama-3.3-70b-versatile",
            name: "Llama 3.3 70B",
            contextLength: 128000,
            supportsTools: true,
            supportsVision: false,
            default: true,
        },
        {
            id: "llama-3.1-8b-instant",
            name: "Llama 3.1 8B Instant",
            contextLength: 128000,
            supportsTools: true,
            supportsVision: false,
        },
        {
            id: "mixtral-8x7b-32768",
            name: "Mixtral 8x7B",
            contextLength: 32768,
            supportsTools: true,
            supportsVision: false,
        },
        {
            id: "gemma2-9b-it",
            name: "Gemma 2 9B",
            contextLength: 8192,
            supportsTools: true,
            supportsVision: false,
        },
    ],
    createModel({ apiKey, baseUrl, modelId }) {
        const groq = createGroq({
            apiKey,
            baseURL: baseUrl,
        });
        return groq(modelId || "llama-3.3-70b-versatile");
    },
};
