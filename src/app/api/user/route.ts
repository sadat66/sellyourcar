import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// GET /api/user - get current user profile
export async function GET() {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let profile = await prisma.user.findUnique({
            where: { id: user.id },
        });

        if (!profile) {
            profile = await prisma.user.create({
                data: {
                    id: user.id,
                    email: user.email!,
                    fullName: user.user_metadata?.full_name || null,
                },
            });
        }

        return NextResponse.json(profile);
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json(
            { error: "Failed to fetch user" },
            { status: 500 }
        );
    }
}

// PUT /api/user - update user profile
export async function PUT(request: NextRequest) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        const profile = await prisma.user.upsert({
            where: { id: user.id },
            update: {
                fullName: body.fullName,
                phone: body.phone,
                location: body.location,
                bio: body.bio,
                avatar: body.avatar,
            },
            create: {
                id: user.id,
                email: user.email!,
                fullName: body.fullName,
                phone: body.phone,
                location: body.location,
                bio: body.bio,
                avatar: body.avatar,
            },
        });

        return NextResponse.json(profile);
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        );
    }
}
