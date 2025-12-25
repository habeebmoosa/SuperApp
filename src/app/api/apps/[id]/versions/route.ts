import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// Helper to calculate next version
function calculateNextVersion(currentVersion: string, changeType: "major" | "minor" | "patch"): string {
    const [major, minor, patch] = currentVersion.split(".").map(Number);

    switch (changeType) {
        case "major": return `${major + 1}.0.0`;
        case "minor": return `${major}.${minor + 1}.0`;
        case "patch": return `${major}.${minor}.${patch + 1}`;
    }
}

// Helper to detect change type from config diff
function detectChangeType(
    oldConfig: Record<string, unknown> | null,
    newConfig: Record<string, unknown>
): "major" | "minor" | "patch" {
    if (!oldConfig) return "major"; // First version

    // Check for breaking changes (inputs removed)
    const oldInputs = (oldConfig.inputs as Array<{ id: string }>) || [];
    const newInputs = (newConfig.inputs as Array<{ id: string }>) || [];
    const oldInputIds = new Set(oldInputs.map(i => i.id));
    const newInputIds = new Set(newInputs.map(i => i.id));

    // If any input was removed, it's a major change
    for (const id of oldInputIds) {
        if (!newInputIds.has(id)) return "major";
    }

    // If new inputs were added, it's a minor change
    for (const id of newInputIds) {
        if (!oldInputIds.has(id)) return "minor";
    }

    // Otherwise it's a patch (styling, labels, etc.)
    return "patch";
}

// GET /api/apps/[id]/versions - List all versions for an app
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const user = await getCurrentUser();
        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Verify app ownership
        const app = await prisma.app.findFirst({
            where: { id, userId: user.id }
        });

        if (!app) {
            return NextResponse.json({ error: "App not found" }, { status: 404 });
        }

        const versions = await prisma.appVersion.findMany({
            where: { appId: id },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                version: true,
                changelog: true,
                createdAt: true,
                messageId: true
            }
        });

        return NextResponse.json({
            currentVersion: app.currentVersion,
            versions
        });
    } catch (error) {
        console.error("Error fetching versions:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

const SaveVersionSchema = z.object({
    changelog: z.string().max(500).optional(),
    forceVersion: z.string().regex(/^\d+\.\d+\.\d+$/).optional(), // Allow manual version override
    messageId: z.string().optional(), // Reference to message that created this version
});

// POST /api/apps/[id]/versions - Save a new version
export async function POST(request: Request, { params }: RouteParams) {
    try {
        const user = await getCurrentUser();
        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const result = SaveVersionSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid input", details: result.error.flatten() },
                { status: 400 }
            );
        }

        // Get the app
        const app = await prisma.app.findFirst({
            where: { id, userId: user.id },
            include: {
                versions: {
                    orderBy: { createdAt: "desc" },
                    take: 1
                }
            }
        });

        if (!app) {
            return NextResponse.json({ error: "App not found" }, { status: 404 });
        }

        // Get the previous version's config for comparison
        const previousVersion = app.versions[0];
        const previousConfig = previousVersion?.appConfig as Record<string, unknown> | null;

        // Calculate next version
        let nextVersion: string;
        if (result.data.forceVersion) {
            nextVersion = result.data.forceVersion;
        } else if (!previousVersion) {
            nextVersion = "1.0.0";
        } else {
            const changeType = detectChangeType(previousConfig, app.appConfig as Record<string, unknown>);
            nextVersion = calculateNextVersion(app.currentVersion, changeType);
        }

        // Check for version conflict
        const existingVersion = await prisma.appVersion.findUnique({
            where: { appId_version: { appId: id, version: nextVersion } }
        });

        if (existingVersion) {
            return NextResponse.json(
                { error: `Version ${nextVersion} already exists` },
                { status: 409 }
            );
        }

        // Create the version and update app
        const [version] = await prisma.$transaction([
            prisma.appVersion.create({
                data: {
                    appId: id,
                    version: nextVersion,
                    appConfig: app.appConfig as Prisma.InputJsonValue,
                    appCode: app.appCode,
                    changelog: result.data.changelog,
                    messageId: result.data.messageId
                }
            }),
            prisma.app.update({
                where: { id },
                data: { currentVersion: nextVersion }
            })
        ]);

        return NextResponse.json({
            version: version.version,
            id: version.id,
            message: `Saved as version ${version.version}`
        }, { status: 201 });
    } catch (error) {
        console.error("Error saving version:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
