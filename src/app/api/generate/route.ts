import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { generateAppConfig, refineAppConfig } from "@/lib/ai";
import { findMatchingTemplate, templateToAppConfig, type AppTemplate } from "@/lib/templates";
import { validateAppCode } from "@/lib/engine/validator";
import { z } from "zod";
import type { AppConfig } from "@/schemas/app-config";

const GenerateSchema = z.object({
    prompt: z.string().min(5).max(2000),
    currentConfig: z.any().optional(), // Existing config for refinement
    useTemplates: z.boolean().optional().default(true), // Whether to try templates first
});

/**
 * POST /api/generate - Generate app config from prompt
 * 
 * Flow:
 * 1. Try to match a pre-built template (most reliable)
 * 2. If no template match, use AI generation
 * 3. Validate generated code before returning
 */
export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const result = GenerateSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid input", details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { prompt, currentConfig, useTemplates } = result.data;

        // REFINEMENT MODE: Update existing config
        if (currentConfig) {
            const appConfig = await refineAppConfig(currentConfig as AppConfig, prompt);

            // Validate the refined code
            if (appConfig.code) {
                const validation = validateAppCode(appConfig.code);
                if (!validation.valid) {
                    console.warn("Refined code validation warning:", validation.error);
                }
            }

            return NextResponse.json({
                appConfig,
                source: "refined",
            });
        }

        // NEW APP MODE

        // Step 1: Try to match a template (most reliable)
        if (useTemplates) {
            const matchedTemplate = findMatchingTemplate(prompt);

            if (matchedTemplate) {
                // Build AppConfig from template with proper typing
                const templateConfig = templateToAppConfig(matchedTemplate);
                const appConfig = {
                    ...templateConfig,
                    code: matchedTemplate.code,
                } as AppConfig;

                return NextResponse.json({
                    appConfig,
                    source: "template",
                    templateId: matchedTemplate.id,
                    message: `Created using the "${matchedTemplate.name}" template for reliability.`,
                });
            }
        }

        // Step 2: Fall back to AI generation
        const appConfig = await generateAppConfig(prompt);

        // Step 3: Validate generated code
        let validationWarning: string | undefined;
        if (appConfig.code) {
            const validation = validateAppCode(appConfig.code);
            if (!validation.valid) {
                validationWarning = validation.error;
                console.warn("Generated code validation failed:", validation.error);

                // Don't fail - let the user try it, but include the warning
            }
        }

        return NextResponse.json({
            appConfig,
            source: "ai-generated",
            validationWarning,
        });
    } catch (error) {
        console.error("Error generating app config:", error);

        // Return user-friendly error
        const message = error instanceof Error
            ? error.message
            : "Failed to generate app configuration";

        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
