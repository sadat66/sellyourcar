import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// GET /api/cars - list cars with filters
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "12");
        const search = searchParams.get("search") || "";
        const make = searchParams.get("make") || "";
        const model = searchParams.get("model") || "";
        const minYear = searchParams.get("minYear");
        const maxYear = searchParams.get("maxYear");
        const minPrice = searchParams.get("minPrice");
        const maxPrice = searchParams.get("maxPrice");
        const fuelType = searchParams.get("fuelType") || "";
        const transmission = searchParams.get("transmission") || "";
        const bodyType = searchParams.get("bodyType") || "";
        const condition = searchParams.get("condition") || "";
        const location = searchParams.get("location") || "";
        const sortBy = searchParams.get("sortBy") || "newest";
        const sellerId = searchParams.get("sellerId") || "";

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {
            status: "ACTIVE",
        };

        if (sellerId) {
            where.sellerId = sellerId;
            delete where.status; // show all statuses for seller's own listings
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { make: { contains: search, mode: "insensitive" } },
                { model: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }

        if (make) where.make = { equals: make, mode: "insensitive" };
        if (model) where.model = { contains: model, mode: "insensitive" };
        if (minYear) where.year = { ...where.year, gte: parseInt(minYear) };
        if (maxYear) where.year = { ...where.year, lte: parseInt(maxYear) };
        if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice) };
        if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) };
        if (fuelType) where.fuelType = fuelType;
        if (transmission) where.transmission = transmission;
        if (bodyType) where.bodyType = bodyType;
        if (condition) where.condition = condition;
        if (location) where.location = { contains: location, mode: "insensitive" };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let orderBy: any = { createdAt: "desc" };
        switch (sortBy) {
            case "price_asc":
                orderBy = { price: "asc" };
                break;
            case "price_desc":
                orderBy = { price: "desc" };
                break;
            case "year_desc":
                orderBy = { year: "desc" };
                break;
            case "mileage_asc":
                orderBy = { mileage: "asc" };
                break;
            case "oldest":
                orderBy = { createdAt: "asc" };
                break;
            default:
                orderBy = { createdAt: "desc" };
        }

        const skip = (page - 1) * limit;

        const [cars, total] = await Promise.all([
            prisma.car.findMany({
                where,
                orderBy,
                skip,
                take: limit,
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
            }),
            prisma.car.count({ where }),
        ]);

        return NextResponse.json({
            cars,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("Error fetching cars:", error);
        return NextResponse.json(
            { error: "Failed to fetch cars" },
            { status: 500 }
        );
    }
}

// POST /api/cars - create a new listing
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        // Ensure user exists in our DB
        await prisma.user.upsert({
            where: { id: user.id },
            update: {},
            create: {
                id: user.id,
                email: user.email!,
                fullName: user.user_metadata?.full_name || null,
            },
        });

        const car = await prisma.car.create({
            data: {
                title: body.title,
                make: body.make,
                model: body.model,
                year: parseInt(body.year),
                price: parseFloat(body.price),
                mileage: parseInt(body.mileage),
                fuelType: body.fuelType,
                transmission: body.transmission,
                bodyType: body.bodyType,
                color: body.color,
                condition: body.condition,
                description: body.description,
                images: body.images || [],
                location: body.location,
                features: body.features || [],
                status: body.status || "ACTIVE",
                sellerId: user.id,
            },
            include: {
                seller: true,
            },
        });

        return NextResponse.json(car, { status: 201 });
    } catch (error) {
        console.error("Error creating car:", error);
        return NextResponse.json(
            { error: "Failed to create listing" },
            { status: 500 }
        );
    }
}
