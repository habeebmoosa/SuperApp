/**
 * Google Gemini Provider
 */

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { AIProvider, ProviderConfig } from "./base";

export const googleProvider: AIProvider = {
    id: "GOOGLE",
    name: "Google Gemini",
    description: "Google's Gemini family of models with large context windows",
    models: [
        {
            id: "gemini-2.5-flash",
            name: "Gemini 2.5 Flash",
            contextLength: 1000000,
            supportsTools: true,
            supportsVision: true,
            default: true,
        },
        {
            id: "gemini-2.5-pro",
            name: "Gemini 2.5 Pro",
            contextLength: 1000000,
            supportsTools: true,
            supportsVision: true,
        },
        {
            id: "gemini-2.0-flash",
            name: "Gemini 2.0 Flash",
            contextLength: 1000000,
            supportsTools: true,
            supportsVision: true,
        },
        {
            id: "gemini-1.5-flash",
            name: "Gemini 1.5 Flash",
            contextLength: 1000000,
            supportsTools: true,
            supportsVision: true,
        },
        {
            id: "gemini-1.5-pro",
            name: "Gemini 1.5 Pro",
            contextLength: 2000000,
            supportsTools: true,
            supportsVision: true,
        },
    ],
    createModel({ apiKey, baseUrl, modelId }) {
        const google = createGoogleGenerativeAI({
            apiKey,
            baseURL: baseUrl,
        });
        return google(modelId || "gemini-2.5-flash");
    },
};
