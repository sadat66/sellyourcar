"use client";

import Link from "next/link";
import { Heart, MapPin, Fuel, Gauge, Calendar } from "lucide-react";
import { CarListing } from "@/lib/types";
import { formatPrice, formatMileage, getFuelTypeLabel, getTransmissionLabel } from "@/lib/utils";
import { useState } from "react";

interface CarCardProps {
    car: CarListing;
    isFavorited?: boolean;
    onToggleFavorite?: (carId: string) => void;
    showStatus?: boolean;
}

export default function CarCard({ car, isFavorited = false, onToggleFavorite, showStatus }: CarCardProps) {
    const [imgError, setImgError] = useState(false);
    const [favorited, setFavorited] = useState(isFavorited);

    const handleFavorite = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setFavorited(!favorited);
        onToggleFavorite?.(car.id);
    };

    return (
        <Link href={`/cars/${car.id}`} style={{ textDecoration: "none" }}>
            <div className="card group cursor-pointer">
                {/* Image */}
                <div className="car-image-container">
                    {car.images?.[0] && !imgError ? (
                        <img
                            src={car.images[0]}
                            alt={car.title}
                            onError={() => setImgError(true)}
                            loading="lazy"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--card)] to-[var(--card-hover)]">
                            <div className="text-center">
                                <Gauge size={40} className="mx-auto text-[var(--muted)] mb-2 opacity-40" />
                                <span className="text-xs text-[var(--muted)] opacity-60">{car.make} {car.model}</span>
                            </div>
                        </div>
                    )}

                    {/* Favorite Button */}
                    {onToggleFavorite && (
                        <button
                            onClick={handleFavorite}
                            className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 z-10"
                            style={{
                                background: favorited ? "var(--danger)" : "rgba(0,0,0,0.5)",
                                backdropFilter: "blur(8px)",
                            }}
                        >
                            <Heart
                                size={16}
                                className="text-white"
                                fill={favorited ? "white" : "none"}
                            />
                        </button>
                    )}

                    {/* Status Badge */}
                    {showStatus && car.status !== "ACTIVE" && (
                        <div className="absolute top-3 left-3">
                            <span
                                className={`badge ${car.status === "SOLD"
                                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                                        : car.status === "PENDING"
                                            ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                            : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                                    }`}
                            >
                                {car.status}
                            </span>
                        </div>
                    )}

                    {/* Condition Badge */}
                    <div className="absolute bottom-3 left-3">
                        <span className="badge bg-black/50 text-white border-white/20" style={{ backdropFilter: "blur(8px)" }}>
                            {car.condition === "LIKE_NEW" ? "Like New" : car.condition.charAt(0) + car.condition.slice(1).toLowerCase()}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-white text-sm leading-tight line-clamp-1 group-hover:text-[var(--accent-hover)] transition-colors">
                            {car.title}
                        </h3>
                        <span className="text-lg font-bold gradient-text whitespace-nowrap">
                            {formatPrice(car.price)}
                        </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-[var(--muted)] mb-3">
                        <MapPin size={12} />
                        {car.location}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                            <Calendar size={13} className="text-[var(--accent)] shrink-0" />
                            <span>{car.year}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                            <Gauge size={13} className="text-[var(--accent)] shrink-0" />
                            <span className="truncate">{formatMileage(car.mileage)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                            <Fuel size={13} className="text-[var(--accent)] shrink-0" />
                            <span className="truncate">{getFuelTypeLabel(car.fuelType)}</span>
                        </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between">
                        <span className="text-xs text-[var(--muted)]">
                            {getTransmissionLabel(car.transmission)}
                        </span>
                        <span className="text-xs text-[var(--accent)] font-medium">
                            View Details →
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
