/**
 * Providers Listing Route
 * Returns available AI providers and their models
 */

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAvailableProviders } from "@/lib/ai";

/**
 * GET /api/settings/providers
 * Get list of all available AI providers and their models
 */
export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const providers = getAvailableProviders();

        return NextResponse.json({ providers });
    } catch (error) {
        console.error("Error fetching providers:", error);
        return NextResponse.json(
            { error: "Failed to fetch providers" },
            { status: 500 }
        );
    }
}
