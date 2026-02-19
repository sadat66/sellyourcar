import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// GET /api/favorites - get user's favorites
export async function GET() {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const favorites = await prisma.favorite.findMany({
            where: { userId: user.id },
            include: {
                car: {
                    include: {
                        seller: {
                            select: {
                                id: true,
                                fullName: true,
                                avatar: true,
                                location: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(favorites);
    } catch (error) {
        console.error("Error fetching favorites:", error);
        return NextResponse.json(
            { error: "Failed to fetch favorites" },
            { status: 500 }
        );
    }
}

// POST /api/favorites - toggle favorite
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { carId } = await request.json();

        // Check if already favorited
        const existing = await prisma.favorite.findUnique({
            where: {
                userId_carId: {
                    userId: user.id,
                    carId,
                },
            },
        });

        if (existing) {
            // Remove favorite
            await prisma.favorite.delete({ where: { id: existing.id } });
            return NextResponse.json({ favorited: false });
        } else {
            // Add favorite
            await prisma.favorite.create({
                data: {
                    userId: user.id,
                    carId,
                },
            });
            return NextResponse.json({ favorited: true });
        }
    } catch (error) {
        console.error("Error toggling favorite:", error);
        return NextResponse.json(
            { error: "Failed to toggle favorite" },
            { status: 500 }
        );
    }
}
