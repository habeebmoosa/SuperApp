import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/conversations/[id] - Get single conversation with messages
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const user = await getCurrentUser();
        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const conversation = await prisma.appConversation.findFirst({
            where: { id, userId: user.id },
            include: {
                messages: {
                    orderBy: { createdAt: "asc" },
                },
                app: {
                    select: {
                        id: true,
                        name: true,
                        icon: true,
                        currentVersion: true,
                        status: true
                    }
                }
            }
        });

        if (!conversation) {
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }

        return NextResponse.json(conversation);
    } catch (error) {
        console.error("Error fetching conversation:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PATCH /api/conversations/[id] - Update conversation title
export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        const user = await getCurrentUser();
        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        // Verify ownership
        const existing = await prisma.appConversation.findFirst({
            where: { id, userId: user.id }
        });

        if (!existing) {
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }

        const conversation = await prisma.appConversation.update({
            where: { id },
            data: { title: body.title }
        });

        return NextResponse.json(conversation);
    } catch (error) {
        console.error("Error updating conversation:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE /api/conversations/[id] - Delete conversation
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const user = await getCurrentUser();
        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Verify ownership
        const existing = await prisma.appConversation.findFirst({
            where: { id, userId: user.id }
        });

        if (!existing) {
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }

        await prisma.appConversation.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting conversation:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
