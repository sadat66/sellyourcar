"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import CarCard from "@/components/CarCard";
import { CarListing, UserProfile } from "@/lib/types";
import { formatPrice, formatDate, getStatusColor } from "@/lib/utils";
import toast from "react-hot-toast";
import {
    Car,
    Plus,
    Eye,
    Edit,
    Trash2,
    User,
    MapPin,
    Mail,
    Phone,
    Save,
    TrendingUp,
    Heart,
    MessageSquare,
    X,
} from "lucide-react";

export default function DashboardPage() {
    const router = useRouter();
    const supabase = createClient();

    const [activeTab, setActiveTab] = useState<"listings" | "profile">("listings");
    const [listings, setListings] = useState<CarListing[]>([]);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        fullName: "",
        phone: "",
        location: "",
        bio: "",
    });

    useEffect(() => {
        const fetchData = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login");
                return;
            }

            try {
                // Fetch user profile
                const profileRes = await fetch("/api/user");
                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    setProfile(profileData);
                    setProfileForm({
                        fullName: profileData.fullName || "",
                        phone: profileData.phone || "",
                        location: profileData.location || "",
                        bio: profileData.bio || "",
                    });
                }

                // Fetch user's listings
                const carsRes = await fetch(`/api/cars?sellerId=${user.id}`);
                if (carsRes.ok) {
                    const carsData = await carsRes.json();
                    setListings(carsData.cars);
                }
            } catch {
                toast.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const updateProfile = async () => {
        try {
            const res = await fetch("/api/user", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profileForm),
            });

            if (res.ok) {
                const data = await res.json();
                setProfile(data);
                setEditingProfile(false);
                toast.success("Profile updated!");
            }
        } catch {
            toast.error("Failed to update profile");
        }
    };

    const deleteListing = async (carId: string) => {
        if (!confirm("Are you sure you want to delete this listing?")) return;

        try {
            const res = await fetch(`/api/cars/${carId}`, { method: "DELETE" });
            if (res.ok) {
                setListings((prev) => prev.filter((c) => c.id !== carId));
                toast.success("Listing deleted");
            }
        } catch {
            toast.error("Failed to delete listing");
        }
    };

    const updateListingStatus = async (carId: string, status: string) => {
        try {
            const res = await fetch(`/api/cars/${carId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                setListings((prev) =>
                    prev.map((c) => (c.id === carId ? { ...c, status } : c))
                );
                toast.success(`Listing marked as ${status.toLowerCase()}`);
            }
        } catch {
            toast.error("Failed to update status");
        }
    };

    const activeListings = listings.filter((l) => l.status === "ACTIVE");
    const soldListings = listings.filter((l) => l.status === "SOLD");
    const totalValue = activeListings.reduce((sum, l) => sum + l.price, 0);

    if (loading) {
        return (
            <div className="pt-20 pb-12">
                <div className="container-custom">
                    <div className="skeleton h-8 w-48 mb-6" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="skeleton h-24 rounded-xl" />
                        ))}
                    </div>
                    <div className="car-grid">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="card">
                                <div className="car-image-container skeleton" />
                                <div className="p-4 space-y-3">
                                    <div className="skeleton h-4 w-2/3" />
                                    <div className="skeleton h-3 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-20 pb-12 min-h-screen">
            <div className="container-custom">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
                        <p className="text-[var(--muted)] text-sm mt-1">
                            Manage your listings and profile
                        </p>
                    </div>
                    <Link href="/sell" className="btn-primary" style={{ textDecoration: "none" }}>
                        <Plus size={16} />
                        New Listing
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        {
                            label: "Total Listings",
                            value: listings.length,
                            icon: Car,
                            color: "var(--accent)",
                        },
                        {
                            label: "Active",
                            value: activeListings.length,
                            icon: TrendingUp,
                            color: "var(--success)",
                        },
                        {
                            label: "Sold",
                            value: soldListings.length,
                            icon: Heart,
                            color: "#ef4444",
                        },
                        {
                            label: "Total Value",
                            value: formatPrice(totalValue),
                            icon: TrendingUp,
                            color: "#a855f7",
                        },
                    ].map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.label} className="glass-card rounded-xl p-5">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: `${stat.color}15` }}
                                    >
                                        <Icon size={20} style={{ color: stat.color }} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-[var(--muted)]">{stat.label}</p>
                                        <p className="text-lg font-bold text-white">{stat.value}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Tabs */}
                <div className="tab-list mb-6 max-w-xs">
                    <button
                        className={`tab-item ${activeTab === "listings" ? "active" : ""}`}
                        onClick={() => setActiveTab("listings")}
                    >
                        My Listings
                    </button>
                    <button
                        className={`tab-item ${activeTab === "profile" ? "active" : ""}`}
                        onClick={() => setActiveTab("profile")}
                    >
                        Profile
                    </button>
                </div>

                {/* Listings Tab */}
                {activeTab === "listings" && (
                    <div>
                        {listings.length > 0 ? (
                            <div className="space-y-4">
                                {listings.map((car) => (
                                    <div
                                        key={car.id}
                                        className="glass-card rounded-xl p-4 flex flex-col md:flex-row gap-4 animate-fade-in"
                                    >
                                        {/* Image */}
                                        <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden shrink-0 bg-[var(--card-hover)]">
                                            {car.images?.[0] ? (
                                                <img
                                                    src={car.images[0]}
                                                    alt={car.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Car size={32} className="text-[var(--muted)] opacity-30" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h3 className="font-semibold text-white text-sm">
                                                        {car.title}
                                                    </h3>
                                                    <p className="text-lg font-bold gradient-text">
                                                        {formatPrice(car.price)}
                                                    </p>
                                                </div>
                                                <span className={`badge ${getStatusColor(car.status)}`}>
                                                    {car.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-[var(--muted)] mt-1">
                                                Listed {formatDate(car.createdAt)} • {car.year} • {car.mileage.toLocaleString()} mi
                                            </p>

                                            {/* Actions */}
                                            <div className="flex flex-wrap items-center gap-2 mt-3">
                                                <Link href={`/cars/${car.id}`} className="btn-ghost text-xs" style={{ textDecoration: "none" }}>
                                                    <Eye size={14} />
                                                    View
                                                </Link>
                                                {car.status === "ACTIVE" && (
                                                    <button
                                                        onClick={() => updateListingStatus(car.id, "SOLD")}
                                                        className="btn-ghost text-xs text-[var(--success)]"
                                                    >
                                                        <Heart size={14} />
                                                        Mark Sold
                                                    </button>
                                                )}
                                                {car.status === "SOLD" && (
                                                    <button
                                                        onClick={() => updateListingStatus(car.id, "ACTIVE")}
                                                        className="btn-ghost text-xs text-[var(--accent)]"
                                                    >
                                                        <TrendingUp size={14} />
                                                        Reactivate
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteListing(car.id)}
                                                    className="btn-ghost text-xs text-[var(--danger)]"
                                                >
                                                    <Trash2 size={14} />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 glass-card rounded-2xl">
                                <Car size={48} className="mx-auto text-[var(--muted)] mb-4 opacity-40" />
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    No listings yet
                                </h3>
                                <p className="text-[var(--muted)] text-sm mb-6">
                                    Start selling by creating your first listing
                                </p>
                                <Link href="/sell" className="btn-primary" style={{ textDecoration: "none" }}>
                                    <Plus size={16} />
                                    Create Listing
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* Profile Tab */}
                {activeTab === "profile" && (
                    <div className="max-w-2xl animate-fade-in">
                        <div className="glass-card rounded-xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-white">
                                    Profile Information
                                </h2>
                                {!editingProfile ? (
                                    <button
                                        onClick={() => setEditingProfile(true)}
                                        className="btn-secondary"
                                    >
                                        <Edit size={14} />
                                        Edit
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditingProfile(false)}
                                            className="btn-ghost"
                                        >
                                            <X size={14} />
                                            Cancel
                                        </button>
                                        <button onClick={updateProfile} className="btn-primary">
                                            <Save size={14} />
                                            Save
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--accent)] to-purple-500 flex items-center justify-center">
                                    <User size={28} className="text-white" />
                                </div>
                                <div>
                                    <p className="font-medium text-white">
                                        {profile?.fullName || "No name set"}
                                    </p>
                                    <p className="text-sm text-[var(--muted)]">
                                        {profile?.email}
                                    </p>
                                </div>
                            </div>

                            {editingProfile ? (
                                <div className="space-y-4">
                                    <div>
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            value={profileForm.fullName}
                                            onChange={(e) =>
                                                setProfileForm({ ...profileForm, fullName: e.target.value })
                                            }
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label>Phone</label>
                                        <input
                                            type="tel"
                                            value={profileForm.phone}
                                            onChange={(e) =>
                                                setProfileForm({ ...profileForm, phone: e.target.value })
                                            }
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label>Location</label>
                                        <input
                                            type="text"
                                            value={profileForm.location}
                                            onChange={(e) =>
                                                setProfileForm({ ...profileForm, location: e.target.value })
                                            }
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label>Bio</label>
                                        <textarea
                                            value={profileForm.bio}
                                            onChange={(e) =>
                                                setProfileForm({ ...profileForm, bio: e.target.value })
                                            }
                                            className="input-field"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Phone size={16} className="text-[var(--muted)]" />
                                        <span className="text-[var(--muted)]">
                                            {profile?.phone || "No phone number"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <MapPin size={16} className="text-[var(--muted)]" />
                                        <span className="text-[var(--muted)]">
                                            {profile?.location || "No location set"}
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-3 text-sm">
                                        <User size={16} className="text-[var(--muted)] mt-0.5" />
                                        <span className="text-[var(--muted)]">
                                            {profile?.bio || "No bio"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm pt-2 border-t border-[var(--border)]">
                                        <Mail size={16} className="text-[var(--muted)]" />
                                        <span className="text-[var(--muted)]">
                                            Member since {profile?.createdAt ? formatDate(profile.createdAt) : "N/A"}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
