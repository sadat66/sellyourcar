"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    CAR_MAKES,
    FUEL_TYPES,
    TRANSMISSIONS,
    BODY_TYPES,
    CONDITIONS,
    CAR_FEATURES,
} from "@/lib/types";
import toast from "react-hot-toast";
import {
    Car,
    ImagePlus,
    X,
    Check,
    ArrowLeft,
    ArrowRight,
    Plus,
} from "lucide-react";

export default function SellPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState("");

    const [form, setForm] = useState({
        title: "",
        make: "",
        model: "",
        year: "",
        price: "",
        mileage: "",
        fuelType: "",
        transmission: "",
        bodyType: "",
        color: "",
        condition: "",
        description: "",
        images: [] as string[],
        location: "",
        features: [] as string[],
    });

    const updateForm = (key: string, value: string | string[]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const toggleFeature = (feature: string) => {
        setForm((prev) => ({
            ...prev,
            features: prev.features.includes(feature)
                ? prev.features.filter((f) => f !== feature)
                : [...prev.features, feature],
        }));
    };

    const addImage = () => {
        if (imageUrl.trim()) {
            updateForm("images", [...form.images, imageUrl.trim()]);
            setImageUrl("");
        }
    };

    const removeImage = (index: number) => {
        updateForm(
            "images",
            form.images.filter((_, i) => i !== index)
        );
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Auto-generate title if empty
            const title =
                form.title || `${form.year} ${form.make} ${form.model}`;

            const res = await fetch("/api/cars", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    title,
                }),
            });

            if (res.ok) {
                const car = await res.json();
                toast.success("Listing created successfully!");
                router.push(`/cars/${car.id}`);
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to create listing");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const isStep1Valid = form.make && form.model && form.year && form.price;
    const isStep2Valid =
        form.fuelType &&
        form.transmission &&
        form.bodyType &&
        form.condition &&
        form.mileage &&
        form.color;
    const isStep3Valid = form.description && form.location;

    const steps = [
        { num: 1, label: "Basics" },
        { num: 2, label: "Details" },
        { num: 3, label: "Description" },
        { num: 4, label: "Images" },
    ];

    return (
        <div className="pt-20 pb-12 min-h-screen">
            <div className="container-custom max-w-3xl">
                {/* Header */}
                <div className="mb-8">
                    <button onClick={() => router.back()} className="btn-ghost mb-4">
                        <ArrowLeft size={16} />
                        Back
                    </button>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        Sell Your Car
                    </h1>
                    <p className="text-[var(--muted)] text-sm">
                        Create a listing in just a few steps
                    </p>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center gap-2 mb-8">
                    {steps.map((s, i) => (
                        <div key={s.num} className="flex items-center gap-2 flex-1">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s.num
                                        ? "bg-[var(--accent)] text-white"
                                        : "bg-[var(--card)] text-[var(--muted)] border border-[var(--border)]"
                                    }`}
                            >
                                {step > s.num ? <Check size={14} /> : s.num}
                            </div>
                            <span
                                className={`text-xs font-medium hidden sm:block ${step >= s.num ? "text-white" : "text-[var(--muted)]"
                                    }`}
                            >
                                {s.label}
                            </span>
                            {i < steps.length - 1 && (
                                <div
                                    className={`flex-1 h-0.5 rounded-full ${step > s.num
                                            ? "bg-[var(--accent)]"
                                            : "bg-[var(--border)]"
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Form Content */}
                <div className="glass-card rounded-2xl p-6 md:p-8">
                    {/* Step 1: Basics */}
                    {step === 1 && (
                        <div className="space-y-5 animate-fade-in">
                            <h2 className="text-lg font-semibold text-white mb-4">
                                Basic Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label>Make *</label>
                                    <select
                                        value={form.make}
                                        onChange={(e) => updateForm("make", e.target.value)}
                                        className="select-field"
                                    >
                                        <option value="">Select Make</option>
                                        {CAR_MAKES.map((m) => (
                                            <option key={m} value={m}>
                                                {m}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label>Model *</label>
                                    <input
                                        type="text"
                                        value={form.model}
                                        onChange={(e) => updateForm("model", e.target.value)}
                                        placeholder="e.g. Camry, Model 3"
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label>Year *</label>
                                    <select
                                        value={form.year}
                                        onChange={(e) => updateForm("year", e.target.value)}
                                        className="select-field"
                                    >
                                        <option value="">Select Year</option>
                                        {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() + 1 - i).map(
                                            (y) => (
                                                <option key={y} value={y}>
                                                    {y}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <label>Price (USD) *</label>
                                    <input
                                        type="number"
                                        value={form.price}
                                        onChange={(e) => updateForm("price", e.target.value)}
                                        placeholder="25000"
                                        className="input-field"
                                    />
                                </div>
                            </div>
                            <div>
                                <label>Listing Title</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => updateForm("title", e.target.value)}
                                    placeholder={
                                        form.year && form.make && form.model
                                            ? `${form.year} ${form.make} ${form.model}`
                                            : "Auto-generated from make/model/year"
                                    }
                                    className="input-field"
                                />
                                <p className="text-xs text-[var(--muted)] mt-1">
                                    Leave blank to auto-generate from year, make, and model
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Details */}
                    {step === 2 && (
                        <div className="space-y-5 animate-fade-in">
                            <h2 className="text-lg font-semibold text-white mb-4">
                                Vehicle Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label>Mileage *</label>
                                    <input
                                        type="number"
                                        value={form.mileage}
                                        onChange={(e) => updateForm("mileage", e.target.value)}
                                        placeholder="50000"
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label>Color *</label>
                                    <input
                                        type="text"
                                        value={form.color}
                                        onChange={(e) => updateForm("color", e.target.value)}
                                        placeholder="e.g. Midnight Blue"
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label>Fuel Type *</label>
                                    <select
                                        value={form.fuelType}
                                        onChange={(e) => updateForm("fuelType", e.target.value)}
                                        className="select-field"
                                    >
                                        <option value="">Select</option>
                                        {FUEL_TYPES.map((ft) => (
                                            <option key={ft} value={ft}>
                                                {ft}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label>Transmission *</label>
                                    <select
                                        value={form.transmission}
                                        onChange={(e) =>
                                            updateForm("transmission", e.target.value)
                                        }
                                        className="select-field"
                                    >
                                        <option value="">Select</option>
                                        {TRANSMISSIONS.map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label>Body Type *</label>
                                    <select
                                        value={form.bodyType}
                                        onChange={(e) => updateForm("bodyType", e.target.value)}
                                        className="select-field"
                                    >
                                        <option value="">Select</option>
                                        {BODY_TYPES.map((bt) => (
                                            <option key={bt} value={bt}>
                                                {bt}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label>Condition *</label>
                                    <select
                                        value={form.condition}
                                        onChange={(e) => updateForm("condition", e.target.value)}
                                        className="select-field"
                                    >
                                        <option value="">Select</option>
                                        {CONDITIONS.map((c) => (
                                            <option key={c} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Features */}
                            <div>
                                <label>Features</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                    {CAR_FEATURES.map((feature) => (
                                        <button
                                            key={feature}
                                            type="button"
                                            onClick={() => toggleFeature(feature)}
                                            className={`text-left px-3 py-2 rounded-lg text-xs font-medium transition-all border ${form.features.includes(feature)
                                                    ? "bg-[var(--accent)]/15 border-[var(--accent)]/40 text-[var(--accent)]"
                                                    : "bg-[var(--card)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/30"
                                                }`}
                                        >
                                            {form.features.includes(feature) && (
                                                <Check size={12} className="inline mr-1" />
                                            )}
                                            {feature}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Description */}
                    {step === 3 && (
                        <div className="space-y-5 animate-fade-in">
                            <h2 className="text-lg font-semibold text-white mb-4">
                                Description & Location
                            </h2>
                            <div>
                                <label>Description *</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => updateForm("description", e.target.value)}
                                    placeholder="Describe your car in detail. Include highlights, service history, any modifications, reason for selling, etc."
                                    className="input-field"
                                    rows={6}
                                />
                            </div>
                            <div>
                                <label>Location *</label>
                                <input
                                    type="text"
                                    value={form.location}
                                    onChange={(e) => updateForm("location", e.target.value)}
                                    placeholder="e.g. San Francisco, CA"
                                    className="input-field"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 4: Images */}
                    {step === 4 && (
                        <div className="space-y-5 animate-fade-in">
                            <h2 className="text-lg font-semibold text-white mb-4">
                                Photos
                            </h2>
                            <p className="text-sm text-[var(--muted)]">
                                Add image URLs for your car. You can add multiple images.
                            </p>

                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="Paste image URL here..."
                                    className="input-field flex-1"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            addImage();
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={addImage}
                                    className="btn-primary"
                                    disabled={!imageUrl.trim()}
                                >
                                    <Plus size={16} />
                                    Add
                                </button>
                            </div>

                            {/* Image Preview Grid */}
                            {form.images.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {form.images.map((img, i) => (
                                        <div
                                            key={i}
                                            className="relative rounded-xl overflow-hidden border border-[var(--border)] group"
                                            style={{ aspectRatio: "4/3" }}
                                        >
                                            <img
                                                src={img}
                                                alt={`Car photo ${i + 1}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "";
                                                }}
                                            />
                                            <button
                                                onClick={() => removeImage(i)}
                                                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={14} />
                                            </button>
                                            {i === 0 && (
                                                <span className="absolute bottom-2 left-2 badge bg-[var(--accent)]/20 text-[var(--accent)] border-[var(--accent)]/30 text-[10px]">
                                                    Cover Photo
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {form.images.length === 0 && (
                                <div className="border-2 border-dashed border-[var(--border)] rounded-2xl p-12 text-center">
                                    <ImagePlus
                                        size={48}
                                        className="mx-auto text-[var(--muted)] mb-3 opacity-40"
                                    />
                                    <p className="text-[var(--muted)] text-sm">
                                        No images added yet. Paste a URL above to add photos.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--border)]">
                        {step > 1 ? (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="btn-secondary"
                            >
                                <ArrowLeft size={16} />
                                Previous
                            </button>
                        ) : (
                            <div />
                        )}

                        {step < 4 ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                disabled={
                                    (step === 1 && !isStep1Valid) ||
                                    (step === 2 && !isStep2Valid) ||
                                    (step === 3 && !isStep3Valid)
                                }
                                className="btn-primary"
                            >
                                Next
                                <ArrowRight size={16} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="btn-primary"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Car size={16} />
                                        Publish Listing
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
