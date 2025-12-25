/**
 * Mistral AI Provider
 */

import { createMistral } from "@ai-sdk/mistral";
import type { AIProvider, ProviderConfig } from "./base";

export const mistralProvider: AIProvider = {
    id: "MISTRAL",
    name: "Mistral AI",
    description: "Mistral AI's efficient and powerful models",
    models: [
        {
            id: "mistral-large-latest",
            name: "Mistral Large",
            contextLength: 128000,
            supportsTools: true,
            supportsVision: true,
            default: true,
        },
        {
            id: "mistral-medium-latest",
            name: "Mistral Medium",
            contextLength: 32000,
            supportsTools: true,
            supportsVision: false,
        },
        {
            id: "mistral-small-latest",
            name: "Mistral Small",
            contextLength: 32000,
            supportsTools: true,
            supportsVision: false,
        },
        {
            id: "codestral-latest",
            name: "Codestral",
            contextLength: 32000,
            supportsTools: true,
            supportsVision: false,
        },
        {
            id: "pixtral-large-latest",
            name: "Pixtral Large",
            contextLength: 128000,
            supportsTools: true,
            supportsVision: true,
        },
    ],
    createModel({ apiKey, baseUrl, modelId }) {
        const mistral = createMistral({
            apiKey,
            baseURL: baseUrl,
        });
        return mistral(modelId || "mistral-large-latest");
    },
};
