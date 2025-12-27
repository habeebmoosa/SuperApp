import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AppConfigSchema } from "@/schemas/app-config";
import { z } from "zod";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/apps/[id] - Get single app
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const user = await getCurrentUser();
        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const app = await prisma.app.findFirst({
            where: { id, userId: user.id },
            include: {
                _count: {
                    select: { runs: true, data: true },
                },
            },
        });

        if (!app) {
            return NextResponse.json({ error: "App not found" }, { status: 404 });
        }

        return NextResponse.json(app);
    } catch (error) {
        console.error("Error fetching app:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PATCH /api/apps/[id] - Update app
const UpdateAppSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    icon: z.string().optional(),
    status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
    appConfig: AppConfigSchema.optional(),
});

export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        const user = await getCurrentUser();
        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const result = UpdateAppSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid input", details: result.error.flatten() },
                { status: 400 }
            );
        }

        // Verify ownership
        const existingApp = await prisma.app.findFirst({
            where: { id, userId: user.id },
        });

        if (!existingApp) {
            return NextResponse.json({ error: "App not found" }, { status: 404 });
        }

        const updateData: Record<string, unknown> = { ...result.data };

        // Note: Version increments are now handled by the /api/apps/[id]/versions route
        // The PATCH route only updates app data, not the version

        const app = await prisma.app.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(app);
    } catch (error) {
        console.error("Error updating app:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE /api/apps/[id] - Delete app
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const user = await getCurrentUser();
        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Verify ownership
        const existingApp = await prisma.app.findFirst({
            where: { id, userId: user.id },
        });

        if (!existingApp) {
            return NextResponse.json({ error: "App not found" }, { status: 404 });
        }

        await prisma.app.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting app:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
