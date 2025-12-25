import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { MessageRole } from "@/generated/prisma";

interface RouteParams {
    params: Promise<{ id: string }>;
}

const CreateMessageSchema = z.object({
    role: z.enum(["USER", "ASSISTANT", "SYSTEM"]),
    content: z.string().min(1),
    // Artifact data (for assistant messages with app snapshots)
    hasArtifact: z.boolean().optional().default(false),
    artifactName: z.string().optional(),
    artifactIcon: z.string().optional(),
    artifactConfig: z.any().optional(),
    artifactCode: z.string().optional(),
});

// GET /api/conversations/[id]/messages - Get all messages for a conversation
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const user = await getCurrentUser();
        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Verify conversation ownership
        const conversation = await prisma.appConversation.findFirst({
            where: { id, userId: user.id }
        });

        if (!conversation) {
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }

        const messages = await prisma.message.findMany({
            where: { conversationId: id },
            orderBy: { createdAt: "asc" }
        });

        return NextResponse.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/conversations/[id]/messages - Add a message to conversation
export async function POST(request: Request, { params }: RouteParams) {
    try {
        const user = await getCurrentUser();
        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const result = CreateMessageSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid input", details: result.error.flatten() },
                { status: 400 }
            );
        }

        // Verify conversation ownership
        const conversation = await prisma.appConversation.findFirst({
            where: { id, userId: user.id }
        });

        if (!conversation) {
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }

        const { role, content, hasArtifact, artifactName, artifactIcon, artifactConfig, artifactCode } = result.data;

        // Create the message
        const message = await prisma.message.create({
            data: {
                conversationId: id,
                role: role as MessageRole,
                content,
                hasArtifact,
                artifactName,
                artifactIcon,
                artifactConfig,
                artifactCode,
            }
        });

        // Auto-generate conversation title from first user message
        if (role === "USER" && !conversation.title) {
            const title = content.substring(0, 100) + (content.length > 100 ? "..." : "");
            await prisma.appConversation.update({
                where: { id },
                data: { title }
            });
        }

        // Update conversation's updatedAt
        await prisma.appConversation.update({
            where: { id },
            data: { updatedAt: new Date() }
        });

        return NextResponse.json(message, { status: 201 });
    } catch (error) {
        console.error("Error creating message:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
