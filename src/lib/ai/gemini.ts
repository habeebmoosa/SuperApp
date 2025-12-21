import { google } from "@ai-sdk/google";
import { generateObject, generateText, streamObject } from "ai";
import { AppConfigSchema, type AppConfig } from "@/schemas/app-config";
import { APP_BUILDER_SYSTEM_PROMPT, APP_REFINEMENT_PROMPT } from "./prompts";

const model = google("gemini-2.5-flash");

/**
 * Generate a new AppConfig from a user's natural language prompt
 */
export async function generateAppConfig(userPrompt: string): Promise<AppConfig> {
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
    refinement: string
): Promise<AppConfig> {
    const prompt = APP_REFINEMENT_PROMPT
        .replace("{{currentConfig}}", JSON.stringify(currentConfig, null, 2))
        .replace("{{refinement}}", refinement);

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
export async function streamAppConfig(userPrompt: string) {
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
    outputFormat: "text" | "json" | "list" | "markdown" = "text"
): Promise<string> {
    const { text } = await generateText({
        model,
        system: systemPrompt || "You are a helpful assistant.",
        prompt: userPrompt,
    });

    return text;
}
