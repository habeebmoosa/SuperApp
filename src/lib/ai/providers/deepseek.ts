/**
 * DeepSeek Provider
 */

import { createDeepSeek } from "@ai-sdk/deepseek";
import type { AIProvider, ProviderConfig } from "./base";

export const deepseekProvider: AIProvider = {
    id: "DEEPSEEK",
    name: "DeepSeek",
    description: "DeepSeek's powerful reasoning and chat models",
    models: [
        {
            id: "deepseek-chat",
            name: "DeepSeek Chat",
            contextLength: 64000,
            supportsTools: true,
            supportsVision: false,
            default: true,
        },
        {
            id: "deepseek-ai/DeepSeek-V3",
            name: "DeepSeek V3",
            contextLength: 64000,
            supportsTools: false,
            supportsVision: false,
        },
    ],
    createModel({ apiKey, baseUrl, modelId }) {
        const deepseek = createDeepSeek({
            apiKey,
            baseURL: baseUrl,
        });
        return deepseek(modelId || "deepseek-chat");
    },
};
