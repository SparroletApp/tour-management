

interface Audit {
    createdAt?: string;
    updatedAt?: string;
}

export interface TourPackage extends Audit {
    id?: number;
    tourCode?: string | null;
    tourName: string;
    description?: string | null;
    durationDays?: number | null;
    durationNights?: number | null;
    minimumTravellers?: number | null;
    maximumTravellers?: number | null;
    currency?: string | null;
    status?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    coverImageUrl?: string | null;
}

export interface TourDestination extends Audit {
    id?: number;
    tourPackageId?: number;
    countryName?: string | null;
    cityName?: string | null;
    description?: string | null;
    sequenceNumber?: number | null;
    imageUrl?: string | null;
}

export interface TourFlight extends Audit {
    id?: number;
    tourPackageId?: number;
    flightType?: string | null;
    airlineName?: string | null;
    flightNumber?: string | null;
    departureAirport?: string | null;
    arrivalAirport?: string | null;
    departureDateTime?: string | null;
    arrivalDateTime?: string | null;
    baggageAllowance?: string | null;
    cabinBaggage?: string | null;
    remarks?: string | null;
}

export interface TourHotel extends Audit {
    id?: number;
    tourPackageId?: number;
    cityName?: string | null;
    hotelName?: string | null;
    hotelCategory?: string | null;
    checkInDate?: string | null;
    checkOutDate?: string | null;
    numberOfNights?: number | null;
    address?: string | null;
    contactNumber?: string | null;
    remarks?: string | null;
    images?: string[] | null;
}

export interface TourItineraryActivity extends Audit {
    id?: number;
    itineraryDayId?: number;
    activityName?: string | null;
    description?: string | null;
    activityType?: string | null;
    included?: boolean | null;
    optional?: boolean | null;
    sequenceNumber?: number | null;
    additionalPrice?: number | null;
    currency?: string | null;
}

export interface TourItineraryDay extends Audit {
    id?: number;
    tourPackageId?: number;
    dayNumber?: number | null;
    tourDate?: string | null;
    title?: string | null;
    description?: string | null;
    overnightCity?: string | null;
    mealPlan?: string | null;
    activities?: TourItineraryActivity[];
}

export interface TourInclusion extends Audit {
    id?: number;
    tourPackageId?: number;
    description?: string | null;
    sequenceNumber?: number | null;
}

export interface TourExclusion extends Audit {
    id?: number;
    tourPackageId?: number;
    description?: string | null;
    sequenceNumber?: number | null;
}

export interface TourOptionalActivity extends Audit {
    id?: number;
    tourPackageId?: number;
    activityName?: string | null;
    description?: string | null;
    price?: number | null;
    currency?: string | null;
    availabilityType?: string | null;
    active?: boolean | null;
}

export interface TourPriceRule extends Audit {
    id?: number;
    tourPackageId?: number;
    passengerCategory?: string | null;
    roomCategory?: string | null;
    price?: number | null;
    currency?: string | null;
    validFrom?: string | null;
    validUntil?: string | null;
    remarks?: string | null;
}

export interface TourMedia extends Audit {
    id?: number;
    tourPackageId?: number;
    mediaType?: string | null;
    fileName?: string | null;
    fileUrl?: string | null;
    caption?: string | null;
    sequenceNumber?: number | null;
}

export interface TourPackageFull {
    tourPackage: TourPackage;
    destinations: TourDestination[];
    flights: TourFlight[];
    hotels: TourHotel[];
    itineraryDays: TourItineraryDay[];
    inclusions: TourInclusion[];
    exclusions: TourExclusion[];
    optionalActivities: TourOptionalActivity[];
    priceRules: TourPriceRule[];
    media: TourMedia[];
}

export const emptyTourFull = (): TourPackageFull => ({
    tourPackage: {
        tourName: "",
        currency: "INR",
        status: "DRAFT",
        coverImageUrl: "",
    },
    destinations: [],
    flights: [],
    hotels: [],
    itineraryDays: [],
    inclusions: [],
    exclusions: [],
    optionalActivities: [],
    priceRules: [],
    media: [],
});
