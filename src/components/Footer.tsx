import Link from "next/link";
import { Car, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t border-[var(--border)] bg-[var(--card)]">
            <div className="container-custom py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4" style={{ textDecoration: "none" }}>
                            <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{ background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))" }}
                            >
                                <Car size={20} className="text-white" />
                            </div>
                            <span className="text-lg font-bold gradient-text">AutoVault</span>
                        </Link>
                        <p className="text-sm text-[var(--muted)] leading-relaxed">
                            The premium marketplace for buying and selling quality vehicles. Connect with trusted sellers and find your dream car.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Marketplace</h4>
                        <ul className="space-y-2">
                            {[
                                { href: "/cars", label: "Browse Cars" },
                                { href: "/sell", label: "Sell Your Car" },
                                { href: "/cars?bodyType=SUV", label: "SUVs" },
                                { href: "/cars?bodyType=SEDAN", label: "Sedans" },
                                { href: "/cars?fuelType=ELECTRIC", label: "Electric Cars" },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-[var(--muted)] hover:text-white transition-colors"
                                        style={{ textDecoration: "none" }}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Company</h4>
                        <ul className="space-y-2">
                            {[
                                { href: "#", label: "About Us" },
                                { href: "#", label: "Careers" },
                                { href: "#", label: "Terms of Service" },
                                { href: "#", label: "Privacy Policy" },
                                { href: "#", label: "FAQ" },
                            ].map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-[var(--muted)] hover:text-white transition-colors"
                                        style={{ textDecoration: "none" }}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Contact</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2 text-sm text-[var(--muted)]">
                                <Mail size={14} />
                                support@autovault.com
                            </li>
                            <li className="flex items-center gap-2 text-sm text-[var(--muted)]">
                                <Phone size={14} />
                                +1 (555) 123-4567
                            </li>
                            <li className="flex items-center gap-2 text-sm text-[var(--muted)]">
                                <MapPin size={14} />
                                San Francisco, CA
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-[var(--border)] mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-[var(--muted)]">
                        © {new Date().getFullYear()} AutoVault. All rights reserved.
                    </p>
                    <div className="flex gap-4">
                        {["Twitter", "Instagram", "LinkedIn"].map((social) => (
                            <a
                                key={social}
                                href="#"
                                className="text-xs text-[var(--muted)] hover:text-white transition-colors"
                            >
                                {social}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
