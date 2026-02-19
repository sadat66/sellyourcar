import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// GET /api/cars/[id] - get single car
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const car = await prisma.car.findUnique({
            where: { id },
            include: {
                seller: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phone: true,
                        avatar: true,
                        location: true,
                        bio: true,
                        createdAt: true,
                    },
                },
                favorites: {
                    select: { id: true, userId: true },
                },
                _count: {
                    select: { favorites: true },
                },
            },
        });

        if (!car) {
            return NextResponse.json({ error: "Car not found" }, { status: 404 });
        }

        return NextResponse.json(car);
    } catch (error) {
        console.error("Error fetching car:", error);
        return NextResponse.json(
            { error: "Failed to fetch car" },
            { status: 500 }
        );
    }
}

// PUT /api/cars/[id] - update a listing
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const existingCar = await prisma.car.findUnique({ where: { id } });

        if (!existingCar) {
            return NextResponse.json({ error: "Car not found" }, { status: 404 });
        }

        if (existingCar.sellerId !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();

        const updatedCar = await prisma.car.update({
            where: { id },
            data: {
                title: body.title,
                make: body.make,
                model: body.model,
                year: body.year ? parseInt(body.year) : undefined,
                price: body.price ? parseFloat(body.price) : undefined,
                mileage: body.mileage ? parseInt(body.mileage) : undefined,
                fuelType: body.fuelType,
                transmission: body.transmission,
                bodyType: body.bodyType,
                color: body.color,
                condition: body.condition,
                description: body.description,
                images: body.images,
                location: body.location,
                features: body.features,
                status: body.status,
            },
        });

        return NextResponse.json(updatedCar);
    } catch (error) {
        console.error("Error updating car:", error);
        return NextResponse.json(
            { error: "Failed to update listing" },
            { status: 500 }
        );
    }
}

// DELETE /api/cars/[id] - delete a listing
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const existingCar = await prisma.car.findUnique({ where: { id } });

        if (!existingCar) {
            return NextResponse.json({ error: "Car not found" }, { status: 404 });
        }

        if (existingCar.sellerId !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.car.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting car:", error);
        return NextResponse.json(
            { error: "Failed to delete listing" },
            { status: 500 }
        );
    }
}
