"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    Car,
    Heart,
    MessageSquare,
    LogOut,
    Menu,
    X,
    Plus,
    LayoutDashboard,
    User,
    LogIn,
    ChevronDown,
    Settings,
} from "lucide-react";
import { UserProfile } from "@/lib/types";

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            setUser(user);

            // Fetch user profile if authenticated
            if (user) {
                try {
                    const res = await fetch("/api/user");
                    if (res.ok) {
                        const profile = await res.json();
                        setUserProfile(profile);
                    }
                } catch (error) {
                    console.error("Failed to fetch user profile:", error);
                }
            } else {
                setUserProfile(null);
            }
        };
        getUser();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null);
            
            if (session?.user) {
                try {
                    const res = await fetch("/api/user");
                    if (res.ok) {
                        const profile = await res.json();
                        setUserProfile(profile);
                    }
                } catch (error) {
                    console.error("Failed to fetch user profile:", error);
                }
            } else {
                setUserProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        if (dropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownOpen]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Handle mobile menu visibility and close on resize
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) {
                setMobileOpen(false);
            }
        };
        
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    };

    const navLinks = user
        ? [
            { href: "/cars", label: "Browse", icon: Car },
            { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
            { href: "/favorites", label: "Favorites", icon: Heart },
            { href: "/messages", label: "Messages", icon: MessageSquare },
        ]
        : [
            { href: "/cars", label: "Browse", icon: Car },
        ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? "glass shadow-lg shadow-black/20"
                    : "bg-transparent"
                }`}
        >
            <div className="container-custom">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 group"
                        style={{ textDecoration: "none" }}
                    >
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))" }}>
                            <Car size={20} className="text-white" />
                        </div>
                        <span className="text-lg font-bold gradient-text">
                            AutoVault
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                            ? "text-white bg-white/10"
                                            : "text-[var(--muted)] hover:text-white hover:bg-white/5"
                                        }`}
                                    style={{ textDecoration: "none" }}
                                >
                                    <Icon size={16} />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        {user ? (
                            <>
                                <Link href="/sell" className="btn-primary" style={{ textDecoration: "none" }}>
                                    <Plus size={16} />
                                    Sell Car
                                </Link>
                                {/* User Avatar Dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200"
                                    >
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                            {userProfile?.avatar ? (
                                                <img
                                                    src={userProfile.avatar}
                                                    alt={userProfile.fullName || user.email || "User"}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-white text-sm font-semibold">
                                                    {userProfile?.fullName
                                                        ? userProfile.fullName.charAt(0).toUpperCase()
                                                        : user.email?.charAt(0).toUpperCase() || "U"}
                                                </span>
                                            )}
                                        </div>
                                        <ChevronDown size={16} className="text-[var(--muted)]" />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {dropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-56 rounded-lg glass border border-white/10 shadow-lg overflow-hidden animate-slide-down">
                                            <div className="p-3 border-b border-white/10">
                                                <p className="text-sm font-semibold text-white">
                                                    {userProfile?.fullName || "User"}
                                                </p>
                                                <p className="text-xs text-[var(--muted)] truncate">
                                                    {user.email}
                                                </p>
                                            </div>
                                            <div className="py-1">
                                                <Link
                                                    href="/dashboard"
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--muted)] hover:text-white hover:bg-white/5 transition-all"
                                                    style={{ textDecoration: "none" }}
                                                >
                                                    <LayoutDashboard size={16} />
                                                    Dashboard
                                                </Link>
                                                <Link
                                                    href="/dashboard"
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--muted)] hover:text-white hover:bg-white/5 transition-all"
                                                    style={{ textDecoration: "none" }}
                                                >
                                                    <User size={16} />
                                                    Profile
                                                </Link>
                                                <Link
                                                    href="/dashboard"
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--muted)] hover:text-white hover:bg-white/5 transition-all"
                                                    style={{ textDecoration: "none" }}
                                                >
                                                    <Settings size={16} />
                                                    Settings
                                                </Link>
                                            </div>
                                            <div className="border-t border-white/10 py-1">
                                                <button
                                                    onClick={() => {
                                                        handleSignOut();
                                                        setDropdownOpen(false);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-all"
                                                >
                                                    <LogOut size={16} />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="btn-ghost" style={{ textDecoration: "none" }}>
                                    <LogIn size={16} />
                                    Log In
                                </Link>
                                <Link href="/signup" className="btn-primary" style={{ textDecoration: "none" }}>
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="mobile-menu-toggle btn-ghost"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileOpen && (
                    <div className="mobile-menu absolute top-full left-0 right-0 glass border-t border-[var(--border)] mt-2 pt-4 pb-4 animate-slide-down z-50">
                        <div className="flex flex-col gap-1">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive
                                                ? "text-white bg-white/10"
                                                : "text-[var(--muted)] hover:text-white hover:bg-white/5"
                                            }`}
                                        style={{ textDecoration: "none" }}
                                    >
                                        <Icon size={18} />
                                        {link.label}
                                    </Link>
                                );
                            })}
                            <div className="border-t border-[var(--border)] my-2" />
                            {user ? (
                                <>
                                    <Link
                                        href="/sell"
                                        onClick={() => setMobileOpen(false)}
                                        className="btn-primary justify-center"
                                        style={{ textDecoration: "none" }}
                                    >
                                        <Plus size={16} />
                                        Sell Your Car
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleSignOut();
                                            setMobileOpen(false);
                                        }}
                                        className="btn-ghost justify-center mt-2"
                                    >
                                        <LogOut size={16} />
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        onClick={() => setMobileOpen(false)}
                                        className="btn-secondary justify-center"
                                        style={{ textDecoration: "none" }}
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        href="/signup"
                                        onClick={() => setMobileOpen(false)}
                                        className="btn-primary justify-center mt-2"
                                        style={{ textDecoration: "none" }}
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
