export function formatPrice(price: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
}

export function formatMileage(mileage: number): string {
    return new Intl.NumberFormat("en-US").format(mileage) + " mi";
}

export function formatDate(date: string | Date): string {
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(new Date(date));
}

export function timeAgo(date: string | Date): string {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
    return formatDate(date);
}

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w ]+/g, "")
        .replace(/ +/g, "-");
}

export function getConditionLabel(condition: string): string {
    const labels: Record<string, string> = {
        NEW: "New",
        LIKE_NEW: "Like New",
        EXCELLENT: "Excellent",
        GOOD: "Good",
        FAIR: "Fair",
    };
    return labels[condition] || condition;
}

export function getFuelTypeLabel(fuelType: string): string {
    const labels: Record<string, string> = {
        PETROL: "Petrol",
        DIESEL: "Diesel",
        ELECTRIC: "Electric",
        HYBRID: "Hybrid",
        CNG: "CNG",
        LPG: "LPG",
    };
    return labels[fuelType] || fuelType;
}

export function getTransmissionLabel(transmission: string): string {
    const labels: Record<string, string> = {
        AUTOMATIC: "Automatic",
        MANUAL: "Manual",
        CVT: "CVT",
        DCT: "DCT",
    };
    return labels[transmission] || transmission;
}

export function getBodyTypeLabel(bodyType: string): string {
    const labels: Record<string, string> = {
        SEDAN: "Sedan",
        SUV: "SUV",
        HATCHBACK: "Hatchback",
        COUPE: "Coupe",
        CONVERTIBLE: "Convertible",
        WAGON: "Wagon",
        VAN: "Van",
        TRUCK: "Truck",
        PICKUP: "Pickup",
    };
    return labels[bodyType] || bodyType;
}

export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        ACTIVE: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        SOLD: "bg-red-500/20 text-red-400 border-red-500/30",
        PENDING: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        DRAFT: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };
    return colors[status] || "";
}

export function generateCarImagePlaceholder(make: string, model: string): string {
    // Returns a placeholder gradient based on car make for visual consistency
    const hash = (make + model).split("").reduce((a, b) => a + b.charCodeAt(0), 0);
    const hue = hash % 360;
    return `linear-gradient(135deg, hsl(${hue}, 60%, 20%) 0%, hsl(${(hue + 40) % 360}, 70%, 30%) 100%)`;
}
