"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, Eye, EyeOff, UserPlus, Car, User } from "lucide-react";
import toast from "react-hot-toast";

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (error) {
                toast.error(error.message);
                return;
            }

            toast.success("Account created! Check your email for verification.");
            router.push("/login");
        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center pt-16 pb-12 px-4 hero-gradient">
            <div className="absolute inset-0 dot-pattern opacity-20" />

            <div className="w-full max-w-md relative z-10 animate-scale-in">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6" style={{ textDecoration: "none" }}>
                        <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))" }}
                        >
                            <Car size={24} className="text-white" />
                        </div>
                    </Link>
                    <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
                    <p className="text-[var(--muted)] text-sm">
                        Join AutoVault to buy and sell vehicles
                    </p>
                </div>

                {/* Form */}
                <div className="glass-card rounded-2xl p-8">
                    <form onSubmit={handleSignup} className="space-y-5">
                        <div>
                            <label>Full Name</label>
                            <div className="relative">
                                <User
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none z-10"
                                />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="John Doe"
                                    className="input-field pl-11 pr-4"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label>Email</label>
                            <div className="relative">
                                <Mail
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none z-10"
                                />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="input-field pl-11 pr-4"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label>Password</label>
                            <div className="relative">
                                <Lock
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none z-10"
                                />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minimum 6 characters"
                                    className="input-field pl-11 pr-11"
                                    minLength={6}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-white transition-colors z-10"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full justify-center py-3"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <UserPlus size={16} />
                                    Create Account
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-[var(--muted)]">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium"
                                style={{ textDecoration: "none" }}
                            >
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
