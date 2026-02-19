export interface CarListing {
    id: string;
    title: string;
    make: string;
    model: string;
    year: number;
    price: number;
    mileage: number;
    fuelType: string;
    transmission: string;
    bodyType: string;
    color: string;
    condition: string;
    description: string;
    images: string[];
    location: string;
    features: string[];
    status: string;
    sellerId: string;
    seller?: UserProfile;
    favorites?: { id: string; userId: string }[];
    createdAt: string;
    updatedAt: string;
}

export interface UserProfile {
    id: string;
    email: string;
    fullName: string | null;
    phone: string | null;
    avatar: string | null;
    location: string | null;
    bio: string | null;
    createdAt: string;
}

export interface MessageThread {
    id: string;
    content: string;
    read: boolean;
    senderId: string;
    receiverId: string;
    carId: string;
    sender: UserProfile;
    receiver: UserProfile;
    car: { id: string; title: string; images: string[]; price: number };
    createdAt: string;
}

export interface SearchFilters {
    make?: string;
    model?: string;
    minYear?: number;
    maxYear?: number;
    minPrice?: number;
    maxPrice?: number;
    fuelType?: string;
    transmission?: string;
    bodyType?: string;
    condition?: string;
    location?: string;
    sortBy?: string;
}

export const CAR_MAKES = [
    "Acura", "Alfa Romeo", "Aston Martin", "Audi", "Bentley", "BMW",
    "Bugatti", "Buick", "Cadillac", "Chevrolet", "Chrysler", "Citroën",
    "Dodge", "Ferrari", "Fiat", "Ford", "Genesis", "GMC", "Honda",
    "Hyundai", "Infiniti", "Jaguar", "Jeep", "Kia", "Lamborghini",
    "Land Rover", "Lexus", "Lincoln", "Lotus", "Maserati", "Mazda",
    "McLaren", "Mercedes-Benz", "Mini", "Mitsubishi", "Nissan", "Pagani",
    "Peugeot", "Porsche", "Ram", "Renault", "Rolls-Royce", "Subaru",
    "Suzuki", "Tesla", "Toyota", "Volkswagen", "Volvo"
];

export const FUEL_TYPES = ["PETROL", "DIESEL", "ELECTRIC", "HYBRID", "CNG", "LPG"];
export const TRANSMISSIONS = ["AUTOMATIC", "MANUAL", "CVT", "DCT"];
export const BODY_TYPES = ["SEDAN", "SUV", "HATCHBACK", "COUPE", "CONVERTIBLE", "WAGON", "VAN", "TRUCK", "PICKUP"];
export const CONDITIONS = ["NEW", "LIKE_NEW", "EXCELLENT", "GOOD", "FAIR"];
export const LISTING_STATUS = ["ACTIVE", "SOLD", "PENDING", "DRAFT"];

export const CAR_FEATURES = [
    "Air Conditioning", "Bluetooth", "Backup Camera", "Navigation",
    "Sunroof", "Leather Seats", "Heated Seats", "Cruise Control",
    "Apple CarPlay", "Android Auto", "Parking Sensors", "Lane Assist",
    "Blind Spot Monitor", "Keyless Entry", "Push Start", "LED Headlights",
    "Alloy Wheels", "Tinted Windows", "Roof Rack", "Tow Hitch",
    "360 Camera", "Head-Up Display", "Wireless Charging", "Premium Audio",
    "Adaptive Cruise Control", "Ventilated Seats", "Panoramic Roof"
];
