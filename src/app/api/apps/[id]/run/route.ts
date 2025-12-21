/**
 * API Route: Run an App
 * POST /api/apps/[id]/run
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { executeApp } from "@/lib/engine/executor";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { inputs } = body;

        // Get the app
        const app = await prisma.app.findFirst({
            where: {
                id,
                userId: session.user.id,
            },
        });

        if (!app) {
            return NextResponse.json({ error: "App not found" }, { status: 404 });
        }

        if (!app.appConfig) {
            return NextResponse.json(
                { error: "App has no configuration" },
                { status: 400 }
            );
        }

        // Execute the app
        const result = await executeApp(
            app.appConfig as Parameters<typeof executeApp>[0],
            inputs || {},
            app.id,
            session.user.id
        );

        // Record the run
        await prisma.appRun.create({
            data: {
                appId: app.id,
                userId: session.user.id,
                inputs: (inputs || {}) as object,
                outputs: result.outputs as object,
                status: result.success ? "SUCCESS" : "FAILED",
                duration: 0, // TODO: Track actual execution time
            },
        });


        if (!result.success) {
            return NextResponse.json(
                { error: result.error || "Execution failed", outputs: {} },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            outputs: result.outputs,
        });
    } catch (error) {
        console.error("Error running app:", error);
        return NextResponse.json(
            { error: "Failed to run app" },
            { status: 500 }
        );
    }
}
