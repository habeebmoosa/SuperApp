import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import { UserConnectorSchema } from "@/schemas/connector";

// GET /api/connectors - List user's connected services
export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const connectors = await prisma.userConnector.findMany({
            where: { userId: user.id },
            include: {
                template: {
                    select: {
                        name: true,
                        icon: true,
                        category: true,
                        type: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(connectors);
    } catch (error) {
        console.error("Error fetching connectors:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/connectors - Create a new connector
export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const result = UserConnectorSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid input", details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { name, templateId, authType, credentials, baseUrl, headers } = result.data;

        // Verify template exists
        const template = await prisma.connectorTemplate.findUnique({
            where: { id: templateId },
        });

        if (!template) {
            return NextResponse.json(
                { error: "Connector template not found" },
                { status: 404 }
            );
        }

        const connector = await prisma.userConnector.create({
            data: {
                name,
                templateId,
                authType,
                credentials, // TODO: Encrypt before storing
                baseUrl,
                headers,
                userId: user.id,
            },
            include: {
                template: {
                    select: {
                        name: true,
                        icon: true,
                        category: true,
                        type: true,
                    },
                },
            },
        });

        return NextResponse.json(connector, { status: 201 });
    } catch (error) {
        console.error("Error creating connector:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
