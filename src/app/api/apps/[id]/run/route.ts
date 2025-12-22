/**
 * API Route: Run an App
 * POST /api/apps/[id]/run
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { executeApp } from "@/lib/engine/executor";
import type { AppConfig } from "@/schemas/app-config";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const startTime = Date.now();

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

        // Get the app config and code
        const appConfig = app.appConfig as AppConfig;

        // Use separate appCode field if available, otherwise fall back to code in appConfig
        // This supports both new (appCode field) and legacy (code in appConfig JSON) apps
        const appCode = (app as any).appCode || appConfig.code;

        // Execute the app
        const result = await executeApp(
            appConfig,
            inputs || {},
            app.id,
            session.user.id,
            appCode
        );

        const duration = Date.now() - startTime;

        // Record the run
        try {
            await prisma.appRun.create({
                data: {
                    appId: app.id,
                    userId: session.user.id,
                    inputs: (inputs || {}) as object,
                    outputs: (result.outputs || {}) as object,
                    status: result.success ? "SUCCESS" : "FAILED",
                    duration: duration,
                    error: result.error,
                },
            });
        } catch (logError) {
            // Don't fail the request if logging fails
            console.error("Failed to log app run:", logError);
        }

        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: result.error || "Execution failed",
                    errorType: result.errorType,
                    outputs: {},
                    executionTime: result.executionTime,
                },
                { status: 422 } // Unprocessable Entity - the request was valid but execution failed
            );
        }

        return NextResponse.json({
            success: true,
            outputs: result.outputs,
            executionTime: result.executionTime,
        });
    } catch (error) {
        console.error("Error running app:", error);

        const message = error instanceof Error
            ? error.message
            : "Failed to run app";

        return NextResponse.json(
            { success: false, error: message, outputs: {} },
            { status: 500 }
        );
    }
}
