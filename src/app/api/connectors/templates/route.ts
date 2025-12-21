import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/connectors/templates - List all connector templates
export async function GET() {
    try {
        const templates = await prisma.connectorTemplate.findMany({
            where: { isActive: true },
            orderBy: [{ category: "asc" }, { name: "asc" }],
        });

        return NextResponse.json(templates);
    } catch (error) {
        console.error("Error fetching connector templates:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
