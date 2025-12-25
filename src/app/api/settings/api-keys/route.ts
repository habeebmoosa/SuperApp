/**
 * API Keys Management Route
 * CRUD operations for user API keys
 */

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { encrypt, decrypt, maskApiKey } from "@/lib/utils/encryption";
import { z } from "zod";
import type { LLMProvider } from "@/generated/prisma";

// Validation schemas
const CreateApiKeySchema = z.object({
    provider: z.enum([
        "GOOGLE",
        "OPENAI",
        "ANTHROPIC",
        "MISTRAL",
        "GROQ",
        "DEEPSEEK",
    ]),
    apiKey: z.string().min(1, "API key is required"),
    baseUrl: z.string().url().optional().nullable(),
    label: z.string().max(100).optional().nullable(),
});

const UpdateApiKeySchema = z.object({
    id: z.string().cuid(),
    apiKey: z.string().min(1).optional(),
    baseUrl: z.string().url().optional().nullable(),
    label: z.string().max(100).optional().nullable(),
    isActive: z.boolean().optional(),
    isDefault: z.boolean().optional(),
});

/**
 * GET /api/settings/api-keys
 * List all API keys for the current user (with masked keys)
 */
export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const apiKeys = await prisma.apiKey.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
        });

        // Return keys with masked values for security
        const maskedKeys = apiKeys.map((key: typeof apiKeys[number]) => ({
            id: key.id,
            provider: key.provider,
            maskedKey: maskApiKey(decrypt(key.apiKey)),
            baseUrl: key.baseUrl,
            label: key.label,
            isActive: key.isActive,
            isDefault: key.isDefault,
            createdAt: key.createdAt,
            updatedAt: key.updatedAt,
        }));

        return NextResponse.json({ apiKeys: maskedKeys });
    } catch (error) {
        console.error("Error fetching API keys:", error);
        return NextResponse.json(
            { error: "Failed to fetch API keys" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/settings/api-keys
 * Create a new API key
 */
export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const result = CreateApiKeySchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid input", details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { provider, apiKey, baseUrl, label } = result.data;

        // Check if user already has a key for this provider
        const existing = await prisma.apiKey.findUnique({
            where: {
                userId_provider: {
                    userId: user.id,
                    provider: provider as LLMProvider,
                },
            },
        });

        if (existing) {
            return NextResponse.json(
                {
                    error: `You already have an API key for ${provider}. Please update or delete it first.`,
                },
                { status: 409 }
            );
        }

        // Encrypt the API key before storing
        const encryptedKey = encrypt(apiKey);

        const newApiKey = await prisma.apiKey.create({
            data: {
                provider: provider as LLMProvider,
                apiKey: encryptedKey,
                baseUrl: baseUrl || null,
                label: label || null,
                userId: user.id,
            },
        });

        return NextResponse.json({
            apiKey: {
                id: newApiKey.id,
                provider: newApiKey.provider,
                maskedKey: maskApiKey(apiKey),
                baseUrl: newApiKey.baseUrl,
                label: newApiKey.label,
                isActive: newApiKey.isActive,
                isDefault: newApiKey.isDefault,
                createdAt: newApiKey.createdAt,
            },
            message: `API key for ${provider} added successfully`,
        });
    } catch (error) {
        console.error("Error creating API key:", error);
        return NextResponse.json(
            { error: "Failed to create API key" },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/settings/api-keys
 * Update an existing API key
 */
export async function PUT(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const result = UpdateApiKeySchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid input", details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { id, apiKey, baseUrl, label, isActive, isDefault } = result.data;

        // Verify ownership
        const existing = await prisma.apiKey.findFirst({
            where: { id, userId: user.id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "API key not found" },
                { status: 404 }
            );
        }

        // Build update data
        const updateData: Record<string, unknown> = {};
        if (apiKey !== undefined) {
            updateData.apiKey = encrypt(apiKey);
        }
        if (baseUrl !== undefined) {
            updateData.baseUrl = baseUrl;
        }
        if (label !== undefined) {
            updateData.label = label;
        }
        if (isActive !== undefined) {
            updateData.isActive = isActive;
        }
        if (isDefault !== undefined) {
            updateData.isDefault = isDefault;
        }

        const updated = await prisma.apiKey.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({
            apiKey: {
                id: updated.id,
                provider: updated.provider,
                maskedKey: maskApiKey(
                    apiKey || decrypt(existing.apiKey)
                ),
                baseUrl: updated.baseUrl,
                label: updated.label,
                isActive: updated.isActive,
                isDefault: updated.isDefault,
                updatedAt: updated.updatedAt,
            },
            message: "API key updated successfully",
        });
    } catch (error) {
        console.error("Error updating API key:", error);
        return NextResponse.json(
            { error: "Failed to update API key" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/settings/api-keys
 * Delete an API key
 */
export async function DELETE(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "API key ID is required" },
                { status: 400 }
            );
        }

        // Verify ownership
        const existing = await prisma.apiKey.findFirst({
            where: { id, userId: user.id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "API key not found" },
                { status: 404 }
            );
        }

        await prisma.apiKey.delete({
            where: { id },
        });

        return NextResponse.json({
            message: `API key for ${existing.provider} deleted successfully`,
        });
    } catch (error) {
        console.error("Error deleting API key:", error);
        return NextResponse.json(
            { error: "Failed to delete API key" },
            { status: 500 }
        );
    }
}
