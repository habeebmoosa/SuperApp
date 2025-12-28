import { NextResponse } from "next/server";

// Check which OAuth providers are configured
const providers = {
    google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    // Add more providers here as needed
    // github: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
};

/**
 * GET /api/auth/providers
 * Returns which OAuth providers are available (based on env vars)
 * This is used by the login/register pages to conditionally show OAuth buttons
 */
export async function GET() {
    return NextResponse.json(providers);
}
