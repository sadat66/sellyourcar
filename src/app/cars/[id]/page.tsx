"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CarListing } from "@/lib/types";
import {
    formatPrice,
    formatMileage,
    formatDate,
    getConditionLabel,
    getFuelTypeLabel,
    getTransmissionLabel,
    getBodyTypeLabel,
    getStatusColor,
} from "@/lib/utils";
import toast from "react-hot-toast";
import {
    ArrowLeft,
    Heart,
    MessageSquare,
    MapPin,
    Calendar,
    Gauge,
    Fuel,
    Palette,
    Cog,
    Shield,
    Share2,
    ChevronLeft,
    ChevronRight,
    User,
    Send,
    Check,
} from "lucide-react";

export default function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const supabase = createClient();

    const [car, setCar] = useState<CarListing | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFavorited, setIsFavorited] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [showContact, setShowContact] = useState(false);
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);

    useEffect(() => {
        const fetchCar = async () => {
            try {
                const res = await fetch(`/api/cars/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setCar(data);
                } else {
                    toast.error("Car not found");
                    router.push("/cars");
                }
            } catch {
                toast.error("Failed to load car details");
            } finally {
                setLoading(false);
            }
        };

        const getUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                // Check if favorited
                const res = await fetch("/api/favorites");
                if (res.ok) {
                    const favs = await res.json();
                    setIsFavorited(favs.some((f: { car: { id: string } }) => f.car.id === id));
                }
            }
        };

        fetchCar();
        getUser();
    }, [id]);

    const toggleFavorite = async () => {
        if (!userId) {
            router.push("/login");
            return;
        }
        try {
            const res = await fetch("/api/favorites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ carId: id }),
            });
            if (res.ok) {
                const data = await res.json();
                setIsFavorited(data.favorited);
                toast.success(data.favorited ? "Added to favorites" : "Removed from favorites");
            }
        } catch {
            toast.error("Failed to update favorite");
        }
    };

    const sendMessage = async () => {
        if (!userId) {
            router.push("/login");
            return;
        }
        if (!message.trim() || !car?.sellerId) return;

        setSending(true);
        try {
            const res = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: message,
                    receiverId: car.sellerId,
                    carId: id,
                }),
            });
            if (res.ok) {
                toast.success("Message sent!");
                setMessage("");
                setShowContact(false);
            }
        } catch {
            toast.error("Failed to send message");
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="pt-20 pb-12">
                <div className="container-custom">
                    <div className="skeleton h-6 w-20 mb-6" />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="skeleton rounded-2xl" style={{ aspectRatio: "4/3" }} />
                        <div className="space-y-4">
                            <div className="skeleton h-8 w-3/4" />
                            <div className="skeleton h-6 w-1/3" />
                            <div className="skeleton h-4 w-1/2" />
                            <div className="skeleton h-32 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!car) return null;

    const specs = [
        { icon: Calendar, label: "Year", value: car.year },
        { icon: Gauge, label: "Mileage", value: formatMileage(car.mileage) },
        { icon: Fuel, label: "Fuel", value: getFuelTypeLabel(car.fuelType) },
        { icon: Cog, label: "Transmission", value: getTransmissionLabel(car.transmission) },
        { icon: Palette, label: "Color", value: car.color },
        { icon: Shield, label: "Condition", value: getConditionLabel(car.condition) },
    ];

    return (
        <div className="pt-20 pb-12">
            <div className="container-custom">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="btn-ghost mb-6"
                >
                    <ArrowLeft size={16} />
                    Back to Listings
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Left: Images */}
                    <div className="lg:col-span-3">
                        {/* Main Image */}
                        <div className="relative rounded-2xl overflow-hidden bg-[var(--card)] border border-[var(--border)]" style={{ aspectRatio: "4/3" }}>
                            {car.images?.[currentImageIndex] ? (
                                <img
                                    src={car.images[currentImageIndex]}
                                    alt={car.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--card)] to-[var(--card-hover)]">
                                    <div className="text-center">
                                        <Gauge size={64} className="mx-auto text-[var(--muted)] mb-3 opacity-30" />
                                        <p className="text-[var(--muted)]">No image available</p>
                                    </div>
                                </div>
                            )}

                            {/* Image Navigation */}
                            {car.images && car.images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentImageIndex((prev) => (prev - 1 + car.images.length) % car.images.length)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-lg flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={() => setCurrentImageIndex((prev) => (prev + 1) % car.images.length)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-lg flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                                    >
                                        <ChevronRight size={20} />
                                    </button>

                                    {/* Dots */}
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                        {car.images.map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentImageIndex(i)}
                                                className={`w-2 h-2 rounded-full transition-all ${i === currentImageIndex
                                                        ? "bg-white w-6"
                                                        : "bg-white/40 hover:bg-white/60"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Thumbnail Row */}
                        {car.images && car.images.length > 1 && (
                            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                                {car.images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentImageIndex(i)}
                                        className={`shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === currentImageIndex
                                                ? "border-[var(--accent)]"
                                                : "border-transparent opacity-60 hover:opacity-100"
                                            }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Description */}
                        <div className="glass-card rounded-xl p-6 mt-6">
                            <h2 className="text-lg font-semibold text-white mb-3">Description</h2>
                            <p className="text-[var(--muted)] text-sm leading-relaxed whitespace-pre-wrap">
                                {car.description}
                            </p>
                        </div>

                        {/* Features */}
                        {car.features && car.features.length > 0 && (
                            <div className="glass-card rounded-xl p-6 mt-4">
                                <h2 className="text-lg font-semibold text-white mb-4">Features</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {car.features.map((feature) => (
                                        <div
                                            key={feature}
                                            className="flex items-center gap-2 text-sm text-[var(--muted)]"
                                        >
                                            <Check size={14} className="text-[var(--success)] shrink-0" />
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Details */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Price & Title Card */}
                        <div className="glass-card rounded-xl p-6">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <span className={`badge ${getStatusColor(car.status)} mb-2`}>{car.status}</span>
                                    <h1 className="text-xl font-bold text-white">{car.title}</h1>
                                </div>
                            </div>

                            <p className="text-3xl font-bold gradient-text mb-4">{formatPrice(car.price)}</p>

                            <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-4">
                                <MapPin size={14} />
                                {car.location}
                            </div>

                            <div className="text-xs text-[var(--muted)]">
                                Listed on {formatDate(car.createdAt)}
                            </div>
                        </div>

                        {/* Specs Grid */}
                        <div className="glass-card rounded-xl p-6">
                            <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Specifications</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {specs.map((spec) => {
                                    const Icon = spec.icon;
                                    return (
                                        <div key={spec.label} className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
                                                <Icon size={18} className="text-[var(--accent)]" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-[var(--muted)]">{spec.label}</p>
                                                <p className="text-sm font-medium text-white">{spec.value}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-4 pt-4 border-t border-[var(--border)]">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
                                        <Gauge size={18} className="text-[var(--accent)]" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-[var(--muted)]">Body Type</p>
                                        <p className="text-sm font-medium text-white">{getBodyTypeLabel(car.bodyType)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={toggleFavorite}
                                className={`btn-secondary flex-1 justify-center ${isFavorited ? "border-red-500 text-red-400" : ""}`}
                            >
                                <Heart size={16} fill={isFavorited ? "currentColor" : "none"} />
                                {isFavorited ? "Saved" : "Save"}
                            </button>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    toast.success("Link copied!");
                                }}
                                className="btn-secondary"
                            >
                                <Share2 size={16} />
                            </button>
                        </div>

                        {/* Seller Card */}
                        <div className="glass-card rounded-xl p-6">
                            <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Seller</h2>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent)] to-purple-500 flex items-center justify-center">
                                    {car.seller?.avatar ? (
                                        <img src={car.seller.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <User size={20} className="text-white" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-white">{car.seller?.fullName || "Seller"}</p>
                                    {car.seller?.location && (
                                        <p className="text-xs text-[var(--muted)] flex items-center gap-1">
                                            <MapPin size={11} />
                                            {car.seller.location}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {userId !== car.sellerId && (
                                <>
                                    {!showContact ? (
                                        <button
                                            onClick={() => {
                                                if (!userId) {
                                                    router.push("/login");
                                                    return;
                                                }
                                                setShowContact(true);
                                            }}
                                            className="btn-primary w-full justify-center"
                                        >
                                            <MessageSquare size={16} />
                                            Contact Seller
                                        </button>
                                    ) : (
                                        <div className="space-y-3 animate-fade-in">
                                            <textarea
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                placeholder={`Hi, I'm interested in your ${car.make} ${car.model}...`}
                                                className="input-field"
                                                rows={3}
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setShowContact(false)}
                                                    className="btn-secondary flex-1 justify-center"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={sendMessage}
                                                    disabled={sending || !message.trim()}
                                                    className="btn-primary flex-1 justify-center"
                                                >
                                                    {sending ? (
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Send size={14} />
                                                            Send
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
