"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CarCard from "@/components/CarCard";
import { CarCardSkeleton } from "@/components/LoadingSpinner";
import { CarListing, CAR_MAKES, FUEL_TYPES, TRANSMISSIONS, BODY_TYPES, CONDITIONS } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import {
    Search,
    SlidersHorizontal,
    X,
    ChevronLeft,
    ChevronRight,
    Car,
} from "lucide-react";

function CarsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    const [cars, setCars] = useState<CarListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

    // Filter state
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [make, setMake] = useState(searchParams.get("make") || "");
    const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
    const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
    const [minYear, setMinYear] = useState(searchParams.get("minYear") || "");
    const [maxYear, setMaxYear] = useState(searchParams.get("maxYear") || "");
    const [fuelType, setFuelType] = useState(searchParams.get("fuelType") || "");
    const [transmission, setTransmission] = useState(searchParams.get("transmission") || "");
    const [bodyType, setBodyType] = useState(searchParams.get("bodyType") || "");
    const [condition, setCondition] = useState(searchParams.get("condition") || "");
    const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "newest");

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                // Fetch favorites
                const res = await fetch("/api/favorites");
                if (res.ok) {
                    const favs = await res.json();
                    setFavoriteIds(new Set(favs.map((f: { car: { id: string } }) => f.car.id)));
                }
            }
        };
        getUser();
    }, []);

    const fetchCars = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("page", String(page));
            params.set("limit", "12");
            if (search) params.set("search", search);
            if (make) params.set("make", make);
            if (minPrice) params.set("minPrice", minPrice);
            if (maxPrice) params.set("maxPrice", maxPrice);
            if (minYear) params.set("minYear", minYear);
            if (maxYear) params.set("maxYear", maxYear);
            if (fuelType) params.set("fuelType", fuelType);
            if (transmission) params.set("transmission", transmission);
            if (bodyType) params.set("bodyType", bodyType);
            if (condition) params.set("condition", condition);
            if (sortBy) params.set("sortBy", sortBy);

            const res = await fetch(`/api/cars?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setCars(data.cars);
                setTotal(data.total);
                setTotalPages(data.totalPages);
            }
        } catch {
            toast.error("Failed to load listings");
        } finally {
            setLoading(false);
        }
    }, [page, search, make, minPrice, maxPrice, minYear, maxYear, fuelType, transmission, bodyType, condition, sortBy]);

    useEffect(() => {
        fetchCars();
    }, [fetchCars]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchCars();
    };

    const clearFilters = () => {
        setSearch("");
        setMake("");
        setMinPrice("");
        setMaxPrice("");
        setMinYear("");
        setMaxYear("");
        setFuelType("");
        setTransmission("");
        setBodyType("");
        setCondition("");
        setSortBy("newest");
        setPage(1);
    };

    const toggleFavorite = async (carId: string) => {
        if (!userId) {
            router.push("/login");
            return;
        }
        try {
            const res = await fetch("/api/favorites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ carId }),
            });
            if (res.ok) {
                const data = await res.json();
                setFavoriteIds((prev) => {
                    const newSet = new Set(prev);
                    if (data.favorited) {
                        newSet.add(carId);
                    } else {
                        newSet.delete(carId);
                    }
                    return newSet;
                });
                toast.success(data.favorited ? "Added to favorites" : "Removed from favorites");
            }
        } catch {
            toast.error("Failed to update favorite");
        }
    };

    const hasActiveFilters = make || minPrice || maxPrice || minYear || maxYear || fuelType || transmission || bodyType || condition;

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

    return (
        <div className="pt-20 pb-12">
            <div className="container-custom">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white">Browse Cars</h1>
                        <p className="text-[var(--muted)] text-sm mt-1">
                            {total} {total === 1 ? "listing" : "listings"} found
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                            className="select-field w-auto"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="year_desc">Year: Newest</option>
                            <option value="mileage_asc">Mileage: Lowest</option>
                        </select>

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`btn-secondary ${hasActiveFilters ? "border-[var(--accent)]" : ""}`}
                        >
                            <SlidersHorizontal size={16} />
                            Filters
                            {hasActiveFilters && (
                                <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="mb-6">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by make, model, or keyword..."
                                className="input-field pl-10"
                            />
                        </div>
                        <button type="submit" className="btn-primary">
                            Search
                        </button>
                    </div>
                </form>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="glass-card rounded-xl p-6 mb-6 animate-slide-down">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-white">Filters</h3>
                            {hasActiveFilters && (
                                <button onClick={clearFilters} className="btn-ghost text-xs text-[var(--danger)]">
                                    <X size={14} />
                                    Clear All
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <div>
                                <label>Make</label>
                                <select value={make} onChange={(e) => { setMake(e.target.value); setPage(1); }} className="select-field">
                                    <option value="">All Makes</option>
                                    {CAR_MAKES.map((m) => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>Body Type</label>
                                <select value={bodyType} onChange={(e) => { setBodyType(e.target.value); setPage(1); }} className="select-field">
                                    <option value="">All Types</option>
                                    {BODY_TYPES.map((bt) => (
                                        <option key={bt} value={bt}>{bt}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>Fuel Type</label>
                                <select value={fuelType} onChange={(e) => { setFuelType(e.target.value); setPage(1); }} className="select-field">
                                    <option value="">All Fuel Types</option>
                                    {FUEL_TYPES.map((ft) => (
                                        <option key={ft} value={ft}>{ft}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>Transmission</label>
                                <select value={transmission} onChange={(e) => { setTransmission(e.target.value); setPage(1); }} className="select-field">
                                    <option value="">All</option>
                                    {TRANSMISSIONS.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>Condition</label>
                                <select value={condition} onChange={(e) => { setCondition(e.target.value); setPage(1); }} className="select-field">
                                    <option value="">All Conditions</option>
                                    {CONDITIONS.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>Min Year</label>
                                <select value={minYear} onChange={(e) => { setMinYear(e.target.value); setPage(1); }} className="select-field">
                                    <option value="">Any</option>
                                    {years.map((y) => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>Min Price</label>
                                <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="$0" className="input-field" />
                            </div>
                            <div>
                                <label>Max Price</label>
                                <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Any" className="input-field" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Results */}
                {loading ? (
                    <div className="car-grid">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <CarCardSkeleton key={i} />
                        ))}
                    </div>
                ) : cars.length > 0 ? (
                    <>
                        <div className="car-grid">
                            {cars.map((car) => (
                                <CarCard
                                    key={car.id}
                                    car={car}
                                    isFavorited={favoriteIds.has(car.id)}
                                    onToggleFavorite={toggleFavorite}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-10">
                                <button
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className="btn-secondary"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum: number;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (page <= 3) {
                                            pageNum = i + 1;
                                        } else if (page >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = page - 2 + i;
                                        }
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setPage(pageNum)}
                                                className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${page === pageNum
                                                        ? "bg-[var(--accent)] text-white"
                                                        : "text-[var(--muted)] hover:text-white hover:bg-white/5"
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                                    disabled={page === totalPages}
                                    className="btn-secondary"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20 glass-card rounded-2xl">
                        <Car size={48} className="mx-auto text-[var(--muted)] mb-4 opacity-40" />
                        <h3 className="text-lg font-semibold text-white mb-2">No cars found</h3>
                        <p className="text-[var(--muted)] text-sm mb-4">Try adjusting your filters or search criteria</p>
                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="btn-secondary">
                                Clear Filters
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function CarsPage() {
    return (
        <Suspense fallback={
            <div className="pt-20 pb-12">
                <div className="container-custom">
                    <div className="skeleton h-8 w-48 mb-6" />
                    <div className="car-grid">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <CarCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>
        }>
            <CarsContent />
        </Suspense>
    );
}
