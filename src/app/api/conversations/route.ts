import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

// GET /api/conversations - List all conversations for current user
export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const conversations = await prisma.appConversation.findMany({
            where: { userId: user.id },
            orderBy: { updatedAt: "desc" },
            include: {
                messages: {
                    take: 1,
                    orderBy: { createdAt: "asc" },
                    select: { content: true }
                },
                app: {
                    select: {
                        id: true,
                        name: true,
                        icon: true,
                        currentVersion: true
                    }
                },
                _count: {
                    select: { messages: true }
                }
            }
        });

        return NextResponse.json(conversations);
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/conversations - Create a new conversation
const CreateConversationSchema = z.object({
    title: z.string().max(200).optional(),
});

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const result = CreateConversationSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid input", details: result.error.flatten() },
                { status: 400 }
            );
        }

        const conversation = await prisma.appConversation.create({
            data: {
                title: result.data.title,
                userId: user.id,
            },
        });

        return NextResponse.json(conversation, { status: 201 });
    } catch (error) {
        console.error("Error creating conversation:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
