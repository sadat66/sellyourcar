import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// GET /api/messages - get user's messages grouped by conversation
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const carId = searchParams.get("carId");
        const otherUserId = searchParams.get("otherUserId");

        if (carId && otherUserId) {
            // Get conversation thread
            const messages = await prisma.message.findMany({
                where: {
                    carId,
                    OR: [
                        { senderId: user.id, receiverId: otherUserId },
                        { senderId: otherUserId, receiverId: user.id },
                    ],
                },
                include: {
                    sender: {
                        select: { id: true, fullName: true, avatar: true },
                    },
                    receiver: {
                        select: { id: true, fullName: true, avatar: true },
                    },
                },
                orderBy: { createdAt: "asc" },
            });

            // Mark messages as read
            await prisma.message.updateMany({
                where: {
                    carId,
                    senderId: otherUserId,
                    receiverId: user.id,
                    read: false,
                },
                data: { read: true },
            });

            return NextResponse.json(messages);
        }

        // Get conversation list (latest message per car+user combo)
        const messages = await prisma.message.findMany({
            where: {
                OR: [{ senderId: user.id }, { receiverId: user.id }],
            },
            include: {
                sender: {
                    select: { id: true, fullName: true, avatar: true, email: true },
                },
                receiver: {
                    select: { id: true, fullName: true, avatar: true, email: true },
                },
                car: {
                    select: { id: true, title: true, images: true, price: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Group by conversation (unique car + other user combination)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const conversationMap = new Map<string, any>();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        messages.forEach((msg: any) => {
            const otherUser = msg.senderId === user.id ? msg.receiverId : msg.senderId;
            const key = `${msg.carId}-${otherUser}`;
            if (!conversationMap.has(key)) {
                conversationMap.set(key, {
                    ...msg,
                    unreadCount: 0,
                });
            }
            if (!msg.read && msg.receiverId === user.id) {
                const conv = conversationMap.get(key);
                conv.unreadCount = (conv.unreadCount || 0) + 1;
            }
        });

        return NextResponse.json(Array.from(conversationMap.values()));
    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json(
            { error: "Failed to fetch messages" },
            { status: 500 }
        );
    }
}

// POST /api/messages - send a message
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { content, receiverId, carId } = await request.json();

        if (!content || !receiverId || !carId) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Ensure user exists in DB
        await prisma.user.upsert({
            where: { id: user.id },
            update: {},
            create: {
                id: user.id,
                email: user.email!,
                fullName: user.user_metadata?.full_name || null,
            },
        });

        const message = await prisma.message.create({
            data: {
                content,
                senderId: user.id,
                receiverId,
                carId,
            },
            include: {
                sender: {
                    select: { id: true, fullName: true, avatar: true },
                },
                receiver: {
                    select: { id: true, fullName: true, avatar: true },
                },
            },
        });

        return NextResponse.json(message, { status: 201 });
    } catch (error) {
        console.error("Error sending message:", error);
        return NextResponse.json(
            { error: "Failed to send message" },
            { status: 500 }
        );
    }
}
