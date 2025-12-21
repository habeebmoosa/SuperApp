import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { generateAppConfig, refineAppConfig, streamAppConfig } from "@/lib/ai";
import { z } from "zod";
import type { AppConfig } from "@/schemas/app-config";

const GenerateSchema = z.object({
    prompt: z.string().min(10).max(2000),
    currentConfig: z.any().optional(), // Existing config for refinement
});

// POST /api/generate - Generate app config from prompt
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

        const { prompt, currentConfig } = result.data;

        let appConfig: AppConfig;

        if (currentConfig) {
            // Refine existing config
            appConfig = await refineAppConfig(currentConfig as AppConfig, prompt);
        } else {
            // Generate new config
            appConfig = await generateAppConfig(prompt);
        }

        return NextResponse.json({ appConfig });
    } catch (error) {
        console.error("Error generating app config:", error);
        return NextResponse.json(
            { error: "Failed to generate app configuration" },
            { status: 500 }
        );
    }
}
