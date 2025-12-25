import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma";

interface RouteParams {
    params: Promise<{ id: string; versionId: string }>;
}

const RollbackSchema = z.object({
    confirm: z.boolean().default(false), // Must be true to proceed with data loss
});

// GET /api/apps/[id]/versions/[versionId]/rollback - Check rollback impact
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const user = await getCurrentUser();
        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, versionId } = await params;

        // Get both app and target version
        const [app, targetVersion] = await Promise.all([
            prisma.app.findFirst({
                where: { id, userId: user.id }
            }),
            prisma.appVersion.findUnique({
                where: { id: versionId }
            })
        ]);

        if (!app) {
            return NextResponse.json({ error: "App not found" }, { status: 404 });
        }

        if (!targetVersion || targetVersion.appId !== id) {
            return NextResponse.json({ error: "Version not found" }, { status: 404 });
        }

        // Check for potential conflicts
        const currentConfig = app.appConfig as Record<string, unknown>;
        const targetConfig = targetVersion.appConfig as Record<string, unknown>;

        // Compare input schemas
        const currentInputs = (currentConfig.inputs as Array<{ id: string; type: string }>) || [];
        const targetInputs = (targetConfig.inputs as Array<{ id: string; type: string }>) || [];

        const currentInputMap = new Map(currentInputs.map(i => [i.id, i]));
        const targetInputMap = new Map(targetInputs.map(i => [i.id, i]));

        const removedInputs: string[] = [];
        const addedInputs: string[] = [];
        const changedInputs: string[] = [];

        for (const [inputId] of currentInputMap) {
            if (!targetInputMap.has(inputId)) {
                removedInputs.push(inputId);
            }
        }

        for (const [inputId] of targetInputMap) {
            if (!currentInputMap.has(inputId)) {
                addedInputs.push(inputId);
            }
        }

        // Check for data schema changes that might affect stored data
        const currentDataSchema = currentConfig.dataSchema as { dataType?: string } | undefined;
        const targetDataSchema = targetConfig.dataSchema as { dataType?: string } | undefined;
        const dataSchemaChanged = JSON.stringify(currentDataSchema) !== JSON.stringify(targetDataSchema);

        // Count potentially affected data records if data schema changed
        let affectedDataCount = 0;
        if (dataSchemaChanged && currentDataSchema?.dataType) {
            affectedDataCount = await prisma.appData.count({
                where: { appId: id, dataType: currentDataSchema.dataType }
            });
        }

        const hasConflict = removedInputs.length > 0 || dataSchemaChanged;

        return NextResponse.json({
            currentVersion: app.currentVersion,
            targetVersion: targetVersion.version,
            hasConflict,
            conflicts: {
                removedInputs,
                addedInputs,
                changedInputs,
                dataSchemaChanged,
                affectedDataCount
            },
            warning: hasConflict
                ? "Rolling back may cause data incompatibility. Some stored data may become orphaned."
                : null
        });
    } catch (error) {
        console.error("Error checking rollback:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/apps/[id]/versions/[versionId]/rollback - Execute rollback
export async function POST(request: Request, { params }: RouteParams) {
    try {
        const user = await getCurrentUser();
        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, versionId } = await params;
        const body = await request.json().catch(() => ({}));
        const result = RollbackSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid input", details: result.error.flatten() },
                { status: 400 }
            );
        }

        // Get app and target version
        const [app, targetVersion] = await Promise.all([
            prisma.app.findFirst({
                where: { id, userId: user.id }
            }),
            prisma.appVersion.findUnique({
                where: { id: versionId }
            })
        ]);

        if (!app) {
            return NextResponse.json({ error: "App not found" }, { status: 404 });
        }

        if (!targetVersion || targetVersion.appId !== id) {
            return NextResponse.json({ error: "Version not found" }, { status: 404 });
        }

        // Check if confirmation is needed
        const currentConfig = app.appConfig as Record<string, unknown>;
        const targetConfig = targetVersion.appConfig as Record<string, unknown>;

        const currentDataSchema = currentConfig.dataSchema as { dataType?: string } | undefined;
        const targetDataSchema = targetConfig.dataSchema as { dataType?: string } | undefined;
        const hasConflict = JSON.stringify(currentDataSchema) !== JSON.stringify(targetDataSchema);

        if (hasConflict && !result.data.confirm) {
            return NextResponse.json(
                { error: "Confirmation required due to potential data loss", requiresConfirmation: true },
                { status: 409 }
            );
        }

        // Save current state as a new version before rollback (for safety)
        const rollbackVersion = `${app.currentVersion}-rollback-${Date.now()}`;

        await prisma.$transaction([
            // Save current state
            prisma.appVersion.create({
                data: {
                    appId: id,
                    version: rollbackVersion,
                    appConfig: app.appConfig as Prisma.InputJsonValue,
                    appCode: app.appCode,
                    changelog: `Auto-saved before rollback to ${targetVersion.version}`
                }
            }),
            // Apply rollback
            prisma.app.update({
                where: { id },
                data: {
                    appConfig: targetVersion.appConfig as Prisma.InputJsonValue,
                    appCode: targetVersion.appCode,
                    currentVersion: targetVersion.version
                }
            })
        ]);

        return NextResponse.json({
            success: true,
            previousVersion: app.currentVersion,
            currentVersion: targetVersion.version,
            backupVersion: rollbackVersion,
            message: `Rolled back to version ${targetVersion.version}. Previous state saved as ${rollbackVersion}`
        });
    } catch (error) {
        console.error("Error rolling back:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
