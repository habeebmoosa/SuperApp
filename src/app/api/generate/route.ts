import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { generateAppConfig, refineAppConfig, type LLMProviderType } from "@/lib/ai";
import { validateAppCode } from "@/lib/engine/validator";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/utils/encryption";
import { z } from "zod";
import type { AppConfig } from "@/schemas/app-config";
import { MessageRole } from "@/generated/prisma";

const GenerateSchema = z.object({
    prompt: z.string().min(5).max(2000),
    currentConfig: z.any().optional(), // Existing config for refinement
    // Custom provider options
    provider: z.enum(["GOOGLE", "OPENAI", "ANTHROPIC", "MISTRAL", "GROQ", "DEEPSEEK"]).optional(),
    modelId: z.string().optional(),
    // Conversation context
    conversationId: z.string().optional(), // Link to conversation for message persistence
});

/**
 * Get user's API key for a provider
 */
async function getUserApiKey(userId: string, provider: LLMProviderType) {
    const apiKey = await prisma.apiKey.findFirst({
        where: {
            userId,
            provider,
            isActive: true,
        },
    });

    if (!apiKey) {
        return null;
    }

    return {
        apiKey: decrypt(apiKey.apiKey),
        baseUrl: apiKey.baseUrl || undefined,
    };
}

/**
 * Store an assistant message with optional artifact
 */
async function storeAssistantMessage(
    conversationId: string,
    content: string,
    appConfig?: AppConfig
) {
    const hasArtifact = !!appConfig;
    const { code, ...configWithoutCode } = appConfig || {};

    return prisma.message.create({
        data: {
            conversationId,
            role: MessageRole.ASSISTANT,
            content,
            hasArtifact,
            artifactName: appConfig?.metadata?.name,
            artifactIcon: appConfig?.metadata?.icon,
            artifactConfig: hasArtifact ? configWithoutCode : undefined,
            artifactCode: code
        }
    });
}

/**
 * POST /api/generate - Generate app config from prompt
 * 
 * Flow:
 * 1. Try to match a pre-built template (most reliable)
 * 2. If no template match, use AI generation
 * 3. Validate generated code before returning
 * 
 * Supports custom provider/model if user has configured API keys
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

        const { prompt, currentConfig, provider, modelId, conversationId } = result.data;

        // If conversationId provided, verify ownership and store user message
        let userMessageId: string | undefined;
        if (conversationId) {
            const conversation = await prisma.appConversation.findFirst({
                where: { id: conversationId, userId: user.id }
            });
            if (!conversation) {
                return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
            }

            // Store user message
            const userMessage = await prisma.message.create({
                data: {
                    conversationId,
                    role: MessageRole.USER,
                    content: prompt,
                    hasArtifact: false
                }
            });
            userMessageId = userMessage.id;

            // Update conversation title from first message if not set
            if (!conversation.title) {
                await prisma.appConversation.update({
                    where: { id: conversationId },
                    data: { title: prompt.substring(0, 100) + (prompt.length > 100 ? "..." : "") }
                });
            }
        }

        // Get generation options
        // Priority: 1. Explicit provider in request, 2. User's first active API key, 3. Env var fallback
        let generationOptions: {
            provider?: LLMProviderType;
            apiKey?: string;
            baseUrl?: string;
            modelId?: string;
        } | undefined;

        if (provider) {
            // Explicit provider specified - use that provider's key
            const userKey = await getUserApiKey(user.id, provider);
            if (!userKey) {
                return NextResponse.json(
                    { error: `No API key found for ${provider}. Please add one in Settings.` },
                    { status: 400 }
                );
            }
            generationOptions = {
                provider,
                apiKey: userKey.apiKey,
                baseUrl: userKey.baseUrl,
                modelId,
            };
        } else {
            // No provider specified - try to use user's first active API key
            const anyActiveKey = await prisma.apiKey.findFirst({
                where: {
                    userId: user.id,
                    isActive: true,
                },
                orderBy: {
                    createdAt: "asc",
                },
            });

            if (anyActiveKey) {
                generationOptions = {
                    provider: anyActiveKey.provider as LLMProviderType,
                    apiKey: decrypt(anyActiveKey.apiKey),
                    baseUrl: anyActiveKey.baseUrl || undefined,
                    modelId,
                };
            }
            // If no keys found, generationOptions stays undefined
            // and generateAppConfig will fall back to env var (if available)
        }

        // REFINEMENT MODE: Update existing config
        if (currentConfig) {
            const appConfig = await refineAppConfig(
                currentConfig as AppConfig,
                prompt,
                generationOptions
            );

            // Validate the refined code
            if (appConfig.code) {
                const validation = validateAppCode(appConfig.code);
                if (!validation.valid) {
                    console.warn("Refined code validation warning:", validation.error);
                }
            }

            // Store assistant message with artifact if in conversation
            let assistantMessageId: string | undefined;
            if (conversationId) {
                const assistantMessage = await storeAssistantMessage(
                    conversationId,
                    `I've updated your app "${appConfig.metadata.name}". ${appConfig.metadata.description || ""}`,
                    appConfig
                );
                assistantMessageId = assistantMessage.id;
            }

            return NextResponse.json({
                appConfig,
                source: "refined",
                usedProvider: provider || "GOOGLE",
                messageId: assistantMessageId,
            });
        }

        // Generate app using AI
        const appConfig = await generateAppConfig(prompt, generationOptions);

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

        // Store assistant message with artifact if in conversation
        let assistantMessageId: string | undefined;
        if (conversationId) {
            const assistantMessage = await storeAssistantMessage(
                conversationId,
                `I've created your app "${appConfig.metadata.name}". ${appConfig.metadata.description || ""}`,
                appConfig
            );
            assistantMessageId = assistantMessage.id;
        }

        return NextResponse.json({
            appConfig,
            source: "ai-generated",
            usedProvider: provider || "GOOGLE",
            validationWarning,
            messageId: assistantMessageId,
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
