"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Search,
  ArrowRight,
  Shield,
  Zap,
  Users,
  TrendingUp,
  Star,
  Car,
  ChevronRight,
} from "lucide-react";
import { CAR_MAKES, BODY_TYPES } from "@/lib/types";
import CarCard from "@/components/CarCard";
import { CarListing } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredCars, setFeaturedCars] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch("/api/cars?limit=6&sortBy=newest");
        if (res.ok) {
          const data = await res.json();
          setFeaturedCars(data.cars || []);
        }
      } catch (error) {
        console.error("Failed to fetch featured cars:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/cars?search=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push("/cars");
    }
  };

  const stats = [
    { label: "Active Listings", value: "10K+", icon: Car },
    { label: "Happy Buyers", value: "25K+", icon: Users },
    { label: "Verified Sellers", value: "5K+", icon: Shield },
    { label: "Avg. Savings", value: "15%", icon: TrendingUp },
  ];

  const features = [
    {
      icon: Shield,
      title: "Verified Sellers",
      description: "Every seller is verified. Buy with confidence knowing you're dealing with real people.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Find your perfect car in minutes with advanced search and smart filters.",
    },
    {
      icon: Users,
      title: "Direct Communication",
      description: "Message sellers directly. No middlemen, no hidden fees.",
    },
    {
      icon: Star,
      title: "Premium Experience",
      description: "Beautiful interface, detailed listings, and a seamless buying experience.",
    },
  ];

  const popularCategories = [
    { label: "SUVs", value: "SUV", emoji: "🚙" },
    { label: "Sedans", value: "SEDAN", emoji: "🚗" },
    { label: "Electric", value: "ELECTRIC", emoji: "⚡" },
    { label: "Trucks", value: "TRUCK", emoji: "🛻" },
    { label: "Coupes", value: "COUPE", emoji: "🏎️" },
    { label: "Luxury", value: "LUXURY", emoji: "✨" },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden pt-24 pb-20 md:pt-32 md:pb-28">
        {/* Background Decorations */}
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent)] rounded-full opacity-5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full opacity-5 blur-[120px]" />

        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-sm font-medium mb-6 animate-fade-in">
              <Zap size={14} />
              The Future of Car Trading
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-slide-up">
              Find Your Next{" "}
              <span className="gradient-text">Dream Car</span>
            </h1>

            <p className="text-lg md:text-xl text-[var(--muted)] mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Discover thousands of quality vehicles from verified sellers.
              Buy, sell, and connect — all in one premium marketplace.
            </p>

            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className="animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="flex items-center gap-0 max-w-2xl mx-auto bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-2xl shadow-black/20 focus-within:border-[var(--accent)] transition-colors">
                <div className="flex items-center gap-3 flex-1 px-5">
                  <Search size={20} className="text-[var(--muted)] shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by make, model, or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-4 bg-transparent text-white text-sm outline-none placeholder:text-[var(--muted)]"
                  />
                </div>
                <button type="submit" className="btn-primary rounded-none rounded-r-2xl h-full px-8 py-4">
                  Search
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-2 mt-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <span className="text-xs text-[var(--muted)]">Popular:</span>
              {["Tesla", "BMW", "Mercedes-Benz", "Toyota", "Porsche"].map((make) => (
                <Link
                  key={make}
                  href={`/cars?make=${encodeURIComponent(make)}`}
                  className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
                  style={{ textDecoration: "none" }}
                >
                  {make}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-[var(--border)] bg-[var(--card)]/50">
        <div className="container-custom py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Icon size={18} className="text-[var(--accent)]" />
                    <span className="text-2xl md:text-3xl font-bold text-white">{stat.value}</span>
                  </div>
                  <span className="text-xs text-[var(--muted)]">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Browse by Category</h2>
              <p className="text-[var(--muted)] text-sm">Find the perfect vehicle type for your needs</p>
            </div>
            <Link href="/cars" className="btn-ghost text-[var(--accent)]" style={{ textDecoration: "none" }}>
              View All <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {popularCategories.map((cat) => (
              <Link
                key={cat.value}
                href={cat.value === "ELECTRIC" ? `/cars?fuelType=${cat.value}` : cat.value === "LUXURY" ? `/cars?make=Mercedes-Benz` : `/cars?bodyType=${cat.value}`}
                className="glass-card rounded-xl p-5 text-center group"
                style={{ textDecoration: "none" }}
              >
                <div className="text-3xl mb-2">{cat.emoji}</div>
                <span className="text-sm font-medium text-white">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 bg-[var(--card)]/30">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Latest Listings</h2>
              <p className="text-[var(--muted)] text-sm">Fresh arrivals from verified sellers</p>
            </div>
            <Link href="/cars" className="btn-secondary" style={{ textDecoration: "none" }}>
              Browse All <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="car-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card">
                  <div className="car-image-container skeleton" />
                  <div className="p-4 space-y-3">
                    <div className="skeleton h-4 w-2/3" />
                    <div className="skeleton h-3 w-1/2" />
                    <div className="grid grid-cols-3 gap-2">
                      <div className="skeleton h-3" />
                      <div className="skeleton h-3" />
                      <div className="skeleton h-3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredCars.length > 0 ? (
            <div className="car-grid">
              {featuredCars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 glass-card rounded-2xl">
              <Car size={48} className="mx-auto text-[var(--muted)] mb-4 opacity-40" />
              <h3 className="text-lg font-semibold text-white mb-2">No listings yet</h3>
              <p className="text-[var(--muted)] text-sm mb-6">Be the first to list your car on AutoVault!</p>
              <Link href="/sell" className="btn-primary" style={{ textDecoration: "none" }}>
                Sell Your Car
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Why Choose <span className="gradient-text">AutoVault</span>?
            </h2>
            <p className="text-[var(--muted)]">
              We've built the most premium car marketplace experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="glass-card rounded-xl p-6 text-center animate-fade-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{
                      background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))",
                      opacity: 0.9,
                    }}
                  >
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/10 to-purple-500/10" />
        <div className="container-custom relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Sell Your Car?
          </h2>
          <p className="text-[var(--muted)] text-lg mb-8 max-w-xl mx-auto">
            List your vehicle in minutes and reach thousands of potential buyers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sell" className="btn-primary text-base px-8 py-3" style={{ textDecoration: "none" }}>
              Start Selling <ArrowRight size={18} />
            </Link>
            <Link href="/cars" className="btn-secondary text-base px-8 py-3" style={{ textDecoration: "none" }}>
              Browse Cars
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
