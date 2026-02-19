"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import CarCard from "@/components/CarCard";
import { CarCardSkeleton } from "@/components/LoadingSpinner";
import { CarListing } from "@/lib/types";
import toast from "react-hot-toast";
import { Heart, Car } from "lucide-react";

export default function FavoritesPage() {
    const router = useRouter();
    const supabase = createClient();
    const [favorites, setFavorites] = useState<{ id: string; car: CarListing }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login");
                return;
            }

            try {
                const res = await fetch("/api/favorites");
                if (res.ok) {
                    const data = await res.json();
                    setFavorites(data);
                }
            } catch {
                toast.error("Failed to load favorites");
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, []);

    const toggleFavorite = async (carId: string) => {
        try {
            const res = await fetch("/api/favorites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ carId }),
            });
            if (res.ok) {
                const data = await res.json();
                if (!data.favorited) {
                    setFavorites((prev) => prev.filter((f) => f.car.id !== carId));
                    toast.success("Removed from favorites");
                }
            }
        } catch {
            toast.error("Failed to update favorite");
        }
    };

    return (
        <div className="pt-20 pb-12 min-h-screen">
            <div className="container-custom">
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                        <Heart size={28} className="text-red-400" />
                        My Favorites
                    </h1>
                    <p className="text-[var(--muted)] text-sm mt-1">
                        {favorites.length} {favorites.length === 1 ? "car" : "cars"} saved
                    </p>
                </div>

                {loading ? (
                    <div className="car-grid">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <CarCardSkeleton key={i} />
                        ))}
                    </div>
                ) : favorites.length > 0 ? (
                    <div className="car-grid">
                        {favorites.map((fav) => (
                            <CarCard
                                key={fav.id}
                                car={fav.car}
                                isFavorited={true}
                                onToggleFavorite={toggleFavorite}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 glass-card rounded-2xl">
                        <Heart size={48} className="mx-auto text-[var(--muted)] mb-4 opacity-40" />
                        <h3 className="text-lg font-semibold text-white mb-2">No favorites yet</h3>
                        <p className="text-[var(--muted)] text-sm mb-6">
                            Browse cars and save the ones you love
                        </p>
                        <Link href="/cars" className="btn-primary" style={{ textDecoration: "none" }}>
                            <Car size={16} />
                            Browse Cars
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
