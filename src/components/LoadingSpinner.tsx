"use client";

import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ size = 24, text }: { size?: number; text?: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
            <Loader2 size={size} className="text-[var(--accent)] animate-spin" />
            {text && <p className="text-sm text-[var(--muted)]">{text}</p>}
        </div>
    );
}

export function CarCardSkeleton() {
    return (
        <div className="card">
            <div className="car-image-container skeleton" />
            <div className="p-4 space-y-3">
                <div className="flex justify-between">
                    <div className="skeleton h-4 w-2/3" />
                    <div className="skeleton h-5 w-20" />
                </div>
                <div className="skeleton h-3 w-1/3" />
                <div className="grid grid-cols-3 gap-2">
                    <div className="skeleton h-3" />
                    <div className="skeleton h-3" />
                    <div className="skeleton h-3" />
                </div>
            </div>
        </div>
    );
}

export function PageSkeleton() {
    return (
        <div className="container-custom pt-24 pb-12">
            <div className="skeleton h-8 w-48 mb-6" />
            <div className="car-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                    <CarCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
