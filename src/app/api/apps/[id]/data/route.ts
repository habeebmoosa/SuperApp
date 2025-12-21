import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

interface RouteParams {
    params: Promise<{ appId: string }>;
}

// GET /api/apps/[appId]/data - Get app data records
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const user = await getCurrentUser();
        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { appId } = await params;
        const { searchParams } = new URL(request.url);
        const dataType = searchParams.get("dataType");
        const limit = parseInt(searchParams.get("limit") || "100");
        const offset = parseInt(searchParams.get("offset") || "0");

        // Verify app ownership
        const app = await prisma.app.findFirst({
            where: { id: appId, userId: user.id },
        });

        if (!app) {
            return NextResponse.json({ error: "App not found" }, { status: 404 });
        }

        const where: { appId: string; userId: string; dataType?: string } = {
            appId,
            userId: user.id,
        };

        if (dataType) {
            where.dataType = dataType;
        }

        const [data, total] = await Promise.all([
            prisma.appData.findMany({
                where,
                orderBy: { createdAt: "desc" },
                take: limit,
                skip: offset,
            }),
            prisma.appData.count({ where }),
        ]);

        return NextResponse.json({ data, total, limit, offset });
    } catch (error) {
        console.error("Error fetching app data:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/apps/[appId]/data - Create app data record
const CreateDataSchema = z.object({
    dataType: z.string().optional(),
    data: z.record(z.any()),
});

export async function POST(request: Request, { params }: RouteParams) {
    try {
        const user = await getCurrentUser();
        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { appId } = await params;
        const body = await request.json();
        const result = CreateDataSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid input", details: result.error.flatten() },
                { status: 400 }
            );
        }

        // Verify app ownership
        const app = await prisma.app.findFirst({
            where: { id: appId, userId: user.id },
        });

        if (!app) {
            return NextResponse.json({ error: "App not found" }, { status: 404 });
        }

        const { dataType, data } = result.data;

        const appData = await prisma.appData.create({
            data: {
                appId,
                userId: user.id,
                dataType,
                data,
            },
        });

        return NextResponse.json(appData, { status: 201 });
    } catch (error) {
        console.error("Error creating app data:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
