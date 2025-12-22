import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AppConfigSchema } from "@/schemas/app-config";
import { validateAppCode } from "@/lib/engine/validator";
import { z } from "zod";

// GET /api/apps - List all apps for current user
export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const apps = await prisma.app.findMany({
            where: { userId: user.id },
            orderBy: { updatedAt: "desc" },
            select: {
                id: true,
                name: true,
                description: true,
                icon: true,
                status: true,
                version: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: { runs: true },
                },
            },
        });

        return NextResponse.json(apps);
    } catch (error) {
        console.error("Error fetching apps:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/apps - Create a new app
const CreateAppSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    icon: z.string().optional(),
    appConfig: AppConfigSchema,
    appCode: z.string().optional(), // Separate code field (preferred)
    originalPrompt: z.string().optional(),
});

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const result = CreateAppSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid input", details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { name, description, icon, appConfig, appCode, originalPrompt } = result.data;

        // Determine which code to use
        // Priority: explicit appCode > code from appConfig
        const codeToStore = appCode || appConfig.code;

        // Validate code if present
        if (codeToStore) {
            const validation = validateAppCode(codeToStore);
            if (!validation.valid) {
                console.warn("App code validation warning:", validation.error);
                // Don't fail - store anyway but log warning
            }
        }

        // Clean appConfig - remove code field since we store it separately
        const cleanConfig = { ...appConfig };
        delete cleanConfig.code;

        // Create the app with code stored separately
        const app = await (prisma.app.create as any)({
            data: {
                name,
                description,
                icon,
                appConfig: cleanConfig,
                appCode: codeToStore, // Store code separately
                originalPrompt,
                userId: user.id,
            },
        });

        return NextResponse.json(app, { status: 201 });
    } catch (error) {
        console.error("Error creating app:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
