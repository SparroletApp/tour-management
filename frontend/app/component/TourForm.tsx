"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import {
    TourPackageFull,
    TourItineraryDay,
    TourMedia,
    emptyTourFull,
} from "../types/tour";

import "./tourform.css";
import ImageUploadWithSearch from "./ImageUploadWithSearch";
import couponService, { Coupon } from "../apiservice/couponservice";

type FieldType =
    | "text"
    | "number"
    | "date"
    | "datetime-local"
    | "checkbox"
    | "textarea"
    | "select"
    | "image"
    | "images";

interface FieldDef {
    key: string;
    label: string;
    type?: FieldType;
    options?: string[];
    wide?: boolean;
}


const CURRENCY_OPTIONS = ["AED", "INR"];

const currencyField = (key = "currency"): FieldDef => ({
    key,
    label: "Currency",
    type: "select",
    options: CURRENCY_OPTIONS,
});

const PACKAGE_FIELDS: FieldDef[] = [
    { key: "tourName", label: "Tour name *" },
    {
        key: "status",
        label: "Status",
        type: "select",
        options: ["DRAFT", "PUBLISHED", "ARCHIVED"],
    },
    currencyField(),
    { key: "startDate", label: "Start date", type: "date" },
    { key: "endDate", label: "End date", type: "date" },
    { key: "durationDays", label: "Duration (days)", type: "number" },
    { key: "durationNights", label: "Duration (nights)", type: "number" },
    { key: "minimumTravellers", label: "Min travellers", type: "number" },
    { key: "maximumTravellers", label: "Max travellers", type: "number" },
    {
        key: "coverImageUrl",
        label: "Tour cover image",
        type: "image",
        wide: true,
    },
    { key: "description", label: "Description", type: "textarea", wide: true },
];

const DESTINATION_FIELDS: FieldDef[] = [
    { key: "countryName", label: "Title" },
    { key: "cityName", label: "City" },
    {
        key: "imageUrl",
        label: "Destination image",
        type: "image",
        wide: true,
    },
    { key: "description", label: "Description", type: "textarea", wide: true },
];

const FLIGHT_FIELDS: FieldDef[] = [
    {
        key: "flightType",
        label: "Flight type",
        type: "select",
        options: ["OUTBOUND", "INBOUND", "INTERNAL"],
    },
    { key: "airlineName", label: "Airline" },
    { key: "flightNumber", label: "Flight number" },
    { key: "departureAirport", label: "From airport" },
    { key: "arrivalAirport", label: "To airport" },
    { key: "departureDateTime", label: "Departure", type: "datetime-local" },
    { key: "arrivalDateTime", label: "Arrival", type: "datetime-local" },
    { key: "baggageAllowance", label: "Baggage allowance" },
    { key: "cabinBaggage", label: "Cabin baggage" },
    { key: "remarks", label: "Remarks", wide: true },
];

const HOTEL_FIELDS: FieldDef[] = [
    { key: "cityName", label: "City" },
    { key: "hotelName", label: "Hotel name" },
    { key: "hotelCategory", label: "Category (e.g. 4 Star)" },
    { key: "checkInDate", label: "Check-in", type: "date" },
    { key: "checkOutDate", label: "Check-out", type: "date" },
    { key: "numberOfNights", label: "Number of nights", type: "number" },
    { key: "contactNumber", label: "Contact number" },
    { key: "address", label: "Address", wide: true },
    {
        key: "images",
        label: "Hotel images (multiple)",
        type: "images",
        wide: true,
    },
    { key: "remarks", label: "Remarks", wide: true },
];

const DAY_FIELDS: FieldDef[] = [
    { key: "dayNumber", label: "Day number", type: "number" },
    { key: "tourDate", label: "Date", type: "date" },
    { key: "title", label: "Day title" },
    { key: "overnightCity", label: "Overnight city" },
    { key: "mealPlan", label: "Meal plan" },
    {
        key: "images",
        label: "Itinerary day images (multiple)",
        type: "images",
        wide: true,
    },
    { key: "description", label: "Description", type: "textarea", wide: true },
];

const ACTIVITY_FIELDS: FieldDef[] = [
    { key: "activityName", label: "Activity name" },
    {
        key: "activityType",
        label: "Activity type",
        type: "select",
        options: [
            "SIGHTSEEING",
            "TRANSFER",
            "MEAL",
            "LEISURE",
            "ADVENTURE",
            "OTHER",
        ],
    },
    { key: "additionalPrice", label: "Extra price", type: "number" },
    currencyField(),
    { key: "included", label: "Included", type: "checkbox" },
    { key: "optional", label: "Optional", type: "checkbox" },
    { key: "description", label: "Description", type: "textarea", wide: true },
];

const TEXT_ITEM_FIELDS: FieldDef[] = [
    { key: "description", label: "Description", type: "textarea", wide: true },
];

const OPTIONAL_ACTIVITY_FIELDS: FieldDef[] = [
    { key: "activityName", label: "Activity name" },
    { key: "price", label: "Price", type: "number" },
    currencyField(),
    { key: "availabilityType", label: "Availability" },
    { key: "active", label: "Active", type: "checkbox" },
    { key: "description", label: "Description", type: "textarea", wide: true },
];

const PRICE_FIELDS: FieldDef[] = [
    {
        key: "passengerCategory",
        label: "Passenger category",
        type: "select",
        options: ["ADULT", "CHILD", "INFANT"],
    },
    {
        key: "roomCategory",
        label: "Room category",
        type: "select",
        options: ["SINGLE", "DOUBLE", "TRIPLE", "QUAD"],
    },
    { key: "price", label: "Price", type: "number" },
    currencyField(),
    { key: "validFrom", label: "Valid from", type: "date" },
    { key: "validUntil", label: "Valid until", type: "date" },
    { key: "remarks", label: "Remarks", wide: true },
];

const TABS = [
    { key: "basic", label: "Basic details", icon: "bi-info-circle" },
    { key: "destinations", label: "Destinations", icon: "bi-geo-alt" },
    { key: "flights", label: "Flights", icon: "bi-airplane" },
    { key: "hotels", label: "Hotels", icon: "bi-building" },
    { key: "itinerary", label: "Itinerary", icon: "bi-calendar-check" },
    { key: "inclusions", label: "Inclusions", icon: "bi-check-circle" },
    { key: "exclusions", label: "Exclusions", icon: "bi-x-circle" },
    { key: "optional", label: "Optional activities", icon: "bi-stars" },
    { key: "pricing", label: "Pricing", icon: "bi-currency-rupee" },
    { key: "media", label: "Media", icon: "bi-images" },
] as const;

type TabKey = (typeof TABS)[number]["key"];


function addDays(
    date: string | null | undefined,
    n: number
): string | null {
    if (!date) return null;

    const d = new Date(date + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + n);

    return d.toISOString().slice(0, 10);
}


function clean<T>(value: T): T {
    if (value === "") return null as unknown as T;

    if (Array.isArray(value)) {
        return value.map(clean) as unknown as T;
    }

    if (value && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value as Record<string, unknown>).map(
                ([key, val]) => [key, clean(val)]
            )
        ) as unknown as T;
    }

    return value;
}

function prepareForSubmit(data: TourPackageFull): TourPackageFull {
    const seq = <T extends { sequenceNumber?: number | null }>(
        rows: T[]
    ): T[] =>
        rows.map((row, index) => ({
            ...row,
            sequenceNumber: index + 1,
        }));

    return clean({
        ...data,
        destinations: seq(data.destinations),
        inclusions: seq(data.inclusions),
        exclusions: seq(data.exclusions),
        media: seq(data.media).map((item) => ({
            ...item,
            mediaType: "IMAGE",
        })),
        itineraryDays: data.itineraryDays.map((day, index) => ({
            ...day,
            dayNumber: day.dayNumber ?? index + 1,
            activities: seq(day.activities ?? []),
        })),
    });
}


function FieldInput({
    def,
    value,
    onChange,
    searchHint,
}: {
    def: FieldDef;
    value: any;
    onChange: (value: any) => void;
    searchHint?: string;
}) {
    const type = def.type ?? "text";

    const className = def.wide
        ? "tour-field tour-field-wide"
        : "tour-field";

    if (type === "image" || type === "images") {
        return (
            <div className={className}>
                <ImageUploadWithSearch
                    label={def.label}
                    value={value}
                    multiple={type === "images"}
                    onChange={onChange}
                    searchHint={searchHint}
                />
            </div>
        );
    }

    if (type === "checkbox") {
        return (
            <label className="tour-checkbox-field">
                <input
                    type="checkbox"
                    checked={!!value}
                    onChange={(e) => onChange(e.target.checked)}
                />
                <span>{def.label}</span>
            </label>
        );
    }

    let control;

    if (type === "textarea") {
        control = (
            <textarea
                rows={3}
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={`Enter ${def.label.replace(" *", "").toLowerCase()}`}
            />
        );
    } else if (type === "select") {
        const options = def.options ?? [];

        const allOptions =
            value && !options.includes(value)
                ? [value, ...options]
                : options;

        control = (
            <select
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="">Select {def.label}</option>

                {allOptions.map((option) => (
                    <option key={option} value={option}>
                        {option.replaceAll("_", " ")}
                    </option>
                ))}
            </select>
        );
    } else if (type === "number") {
        control = (
            <input
                type="number"
                step="any"
                value={value ?? ""}
                onChange={(e) =>
                    onChange(
                        e.target.value === ""
                            ? null
                            : Number(e.target.value)
                    )
                }
                placeholder={`Enter ${def.label.toLowerCase()}`}
            />
        );
    } else if (type === "datetime-local") {
        control = (
            <input
                type="datetime-local"
                value={
                    typeof value === "string"
                        ? value.slice(0, 16)
                        : ""
                }
                onChange={(e) => onChange(e.target.value)}
            />
        );
    } else {
        control = (
            <input
                type={type}
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={`Enter ${def.label.replace(" *", "").toLowerCase()}`}
            />
        );
    }

    return (
        <label className={className}>
            <span className="tour-field-label">{def.label}</span>
            {control}
        </label>
    );
}


function RowsEditor<T extends object>({
    title,
    itemLabel,
    rows,
    fields,
    newRow,
    onChange,
}: {
    title: string;
    itemLabel: string;
    rows: T[];
    fields: FieldDef[];
    newRow: () => T;
    onChange: (rows: T[]) => void;
}) {
    const update = (
        index: number,
        key: string,
        value: any
    ) => {
        onChange(
            rows.map((row, i) =>
                i === index
                    ? { ...row, [key]: value }
                    : row
            )
        );
    };

    return (
        <div className="tour-section">
            <div className="tour-section-heading">
                <div>
                    <h3>{title}</h3>
                    <p>Manage your {title.toLowerCase()} details.</p>
                </div>

                <span className="tour-count">
                    {rows.length} {rows.length === 1 ? "item" : "items"}
                </span>
            </div>

            {rows.length === 0 ? (
                <div className="tour-empty">
                    <i className="bi bi-inbox" />
                    <p>No {title.toLowerCase()} added yet.</p>
                    <span>Click the button below to add your first item.</span>
                </div>
            ) : (
                rows.map((row, index) => (
                    <div className="tour-item-card" key={index}>
                        <div className="tour-item-header">
                            <div className="tour-item-title">
                                <span className="tour-item-number">
                                    {String(index + 1).padStart(2, "0")}
                                </span>
                                <h4>
                                    {itemLabel} {index + 1}
                                </h4>
                            </div>

                            <button
                                type="button"
                                className="tour-remove-btn"
                                onClick={() =>
                                    onChange(
                                        rows.filter(
                                            (_, i) => i !== index
                                        )
                                    )
                                }
                            >
                                <i className="bi bi-trash3" />
                                Remove
                            </button>
                        </div>

                        <div className="tour-form-grid">
                            {fields.map((field) => (
                                <FieldInput
                                    key={field.key}
                                    def={field}
                                    value={
                                        (row as Record<string, any>)[
                                        field.key
                                        ]
                                    }
                                    searchHint={
                                        (row as Record<string, any>).hotelName ||
                                        (row as Record<string, any>).cityName ||
                                        ""
                                    }
                                    onChange={(value) =>
                                        update(index, field.key, value)
                                    }
                                />
                            ))}
                        </div>
                    </div>
                ))
            )}

            <button
                type="button"
                className="tour-add-btn"
                onClick={() => onChange([...rows, newRow()])}
            >
                <i className="bi bi-plus-lg" />
                Add {itemLabel}
            </button>
        </div>
    );
}


export default function TourForm({
    initial,
    submitLabel,
    onSubmit,
}: {
    initial?: TourPackageFull;
    submitLabel: string;
    onSubmit: (data: TourPackageFull) => Promise<void>;
}) {
    const [data, setData] = useState<TourPackageFull>(
        initial ?? emptyTourFull()
    );

    const [tab, setTab] = useState<TabKey>("basic");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [couponSearch, setCouponSearch] = useState("");
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [showCouponSuggestions, setShowCouponSuggestions] = useState(false);
    useEffect(() => {
        const storedCompanyId = sessionStorage.getItem("company_id");

        if (storedCompanyId) {
            setData((previous) => ({
                ...previous,
                tourPackage: {
                    ...previous.tourPackage,
                    companyId: Number(storedCompanyId),
                },
            }));
        }
    }, []);

    const setPkg = (key: string, value: any) => {
        setData((previous) => ({
            ...previous,
            tourPackage: {
                ...previous.tourPackage,
                [key]: value,
            },
        }));
    };

    const setList = <K extends keyof TourPackageFull>(
        key: K,
        value: TourPackageFull[K]
    ) => {
        setData((previous) => ({
            ...previous,
            [key]: value,
        }));
    };

    const updateDay = (
        index: number,
        patch: Partial<TourItineraryDay>
    ) => {
        setData((previous) => ({
            ...previous,
            itineraryDays: previous.itineraryDays.map(
                (day, i) =>
                    i === index
                        ? { ...day, ...patch }
                        : day
            ),
        }));
    };

    const addDay = () => {
        const nextDayNumber = data.itineraryDays.length + 1;

        setList("itineraryDays", [
            ...data.itineraryDays,
            {
                dayNumber: nextDayNumber,
                tourDate: addDays(
                    data.tourPackage.startDate,
                    nextDayNumber - 1
                ),
                title: "",
                description: "",
                overnightCity: "",
                mealPlan: "",
                images: [],
                activities: [],
            },
        ]);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const companyId = Number(sessionStorage.getItem("company_id"));

        if (!companyId || Number.isNaN(companyId)) {
            setError("Company ID not found in session. Please log in again.");
            return;
        }
        if (!data.tourPackage.tourName?.trim()) {
            setError("Tour name is required.");
            setTab("basic");
            return;
        }

        try {
            setSaving(true);
            setError("");

            await onSubmit(
                prepareForSubmit({
                    ...data,
                    tourPackage: {
                        ...data.tourPackage,
                        companyId,
                    },
                })
            );
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to save tour. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        const fetchCompanyCoupons = async () => {
            const companyId = Number(sessionStorage.getItem("company_id"));

            if (!companyId || Number.isNaN(companyId)) {
                return;
            }

            try {
                setCouponLoading(true);

                const response = await couponService.getByCompany({
                    companyId,
                });

                const today = new Date().toISOString().slice(0, 10);

                const activeCoupons = (response ?? []).filter((coupon) => {
                    const isActive = coupon.status === "ACTIVE";

                    const isNotExpired =
                        !coupon.expiryDate || coupon.expiryDate >= today;

                    const hasUsageAvailable =
                        coupon.usageLimit === null ||
                        coupon.usedCount < coupon.usageLimit;

                    return isActive && isNotExpired && hasUsageAvailable;
                });

                setCoupons(activeCoupons);
            } catch (err) {
                console.error("Failed to load company coupons:", err);
                setCoupons([]);
            } finally {
                setCouponLoading(false);
            }
        };

        fetchCompanyCoupons();
    }, []);

    const filteredCoupons = coupons.filter((coupon) =>
        coupon.couponCode
            .toLowerCase()
            .includes(couponSearch.trim().toLowerCase())
    );

    const handleCouponSelect = (coupon: Coupon) => {
        setSelectedCoupon(coupon);
        setCouponSearch(coupon.couponCode);
        setShowCouponSuggestions(false);
        setPkg("couponId", coupon.id);
    };

    const handleCouponClear = () => {
        setSelectedCoupon(null);
        setCouponSearch("");
        setShowCouponSuggestions(false);

        setPkg("couponId", null);
    };

    return (
        <form className="tour-form" onSubmit={handleSubmit}>
            <div className="tour-form-header">
                <div>
                    <span className="tour-eyebrow">
                        TOUR MANAGEMENT
                    </span>
                    <h2>Tour Package Details</h2>
                    <p>
                        Create and manage all your tour package
                        information in one place.
                    </p>
                </div>

                <div className="tour-header-icon">
                    <i className="bi bi-globe2" />
                </div>
            </div>
            <div className="tour-tabs-wrapper">
                <div className="tour-tabs">
                    {TABS.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            className={
                                tab === item.key
                                    ? "tour-tab active"
                                    : "tour-tab"
                            }
                            onClick={() => {
                                setTab(item.key);
                                setError("");
                            }}
                        >
                            <i className={`bi ${item.icon}`} />
                            <span>{item.label}</span>

                            {tab === item.key && (
                                <span className="tour-tab-indicator" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
            {tab === "basic" && (
                <div className="tour-section">
                    <div className="tour-section-heading">
                        <div>
                            <h3>Basic Information</h3>
                            <p>
                                Enter the main information about your
                                tour package.
                            </p>
                        </div>

                        <span className="tour-section-icon">
                            <i className="bi bi-info-circle" />
                        </span>
                    </div>

                    <div className="tour-form-grid">
                        {PACKAGE_FIELDS.map((field) => (
                            <FieldInput
                                key={field.key}
                                def={field}
                                value={
                                    (
                                        data.tourPackage as Record<
                                            string,
                                            any
                                        >
                                    )[field.key]
                                }
                                searchHint={data.tourPackage.tourName ?? ""}
                                onChange={(value) =>
                                    setPkg(field.key, value)
                                }
                            />
                        ))}


                    </div>

                    <div className="tour-coupon-section">
                        <div className="tour-coupon-heading">
                            <div>
                                <h4>
                                    <i className="bi bi-ticket-perforated" />
                                    Apply Coupon
                                </h4>
                                <p>Select a coupon belonging to your company.</p>
                            </div>

                            {selectedCoupon && (
                                <button
                                    type="button"
                                    className="tour-coupon-remove"
                                    onClick={handleCouponClear}
                                >
                                    <i className="bi bi-x-circle" />
                                    Remove
                                </button>
                            )}
                        </div>

                        <div className="tour-coupon-input-wrapper">
                            <div className="tour-coupon-input">
                                <i className="bi bi-tag" />

                                <input
                                    type="text"
                                    value={couponSearch}
                                    placeholder="Search coupon code..."
                                    autoComplete="off"
                                    onFocus={() => setShowCouponSuggestions(true)}
                                    onChange={(e) => {
                                        setCouponSearch(e.target.value);
                                        setSelectedCoupon(null);
                                        setPkg("couponId", null);
                                        setShowCouponSuggestions(true);
                                    }}
                                />

                                {couponLoading && (
                                    <span className="tour-coupon-loading">
                                        <span className="tour-spinner" />
                                    </span>
                                )}
                            </div>

                            {showCouponSuggestions && (
                                <div className="tour-coupon-suggestions">
                                    {couponLoading ? (
                                        <div className="tour-coupon-empty">
                                            Loading coupons...
                                        </div>
                                    ) : filteredCoupons.length > 0 ? (
                                        filteredCoupons.map((coupon) => (
                                            <button
                                                type="button"
                                                key={coupon.id}
                                                className="tour-coupon-option"
                                                onClick={() => handleCouponSelect(coupon)}
                                            >
                                                <div className="tour-coupon-option-info">
                                                    <strong>{coupon.couponCode}</strong>
                                                    <span>
                                                        {coupon.expiryDate
                                                            ? `Expires ${coupon.expiryDate}`
                                                            : "No expiry date"}
                                                    </span>
                                                </div>

                                                <span className="tour-coupon-discount">
                                                    {coupon.percentage}% OFF
                                                </span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="tour-coupon-empty">
                                            {couponSearch
                                                ? "No matching active coupons found."
                                                : "No active coupons available for this company."}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {selectedCoupon && (
                            <div className="tour-coupon-selected">
                                <i className="bi bi-check-circle-fill" />

                                <div>
                                    <strong>{selectedCoupon.couponCode}</strong>
                                    <span>
                                        {selectedCoupon.percentage}% discount applied to this tour.
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {tab === "destinations" && (
                <RowsEditor
                    title="Destinations"
                    itemLabel="destination"
                    rows={data.destinations}
                    fields={DESTINATION_FIELDS}
                    newRow={() => ({
                        countryName: "",
                        cityName: "",
                        imageUrl: "",
                        description: "",
                    })}
                    onChange={(rows) =>
                        setList("destinations", rows)
                    }
                />
            )}

            {tab === "flights" && (
                <RowsEditor
                    title="Flights"
                    itemLabel="flight"
                    rows={data.flights}
                    fields={FLIGHT_FIELDS}
                    newRow={() => ({
                        flightType: "OUTBOUND",
                    })}
                    onChange={(rows) =>
                        setList("flights", rows)
                    }
                />
            )}

            {tab === "hotels" && (
                <RowsEditor
                    title="Hotels"
                    itemLabel="hotel"
                    rows={data.hotels}
                    fields={HOTEL_FIELDS}
                    newRow={() => ({
                        hotelName: "",
                        cityName: "",
                        images: [],
                    })}
                    onChange={(rows) =>
                        setList("hotels", rows)
                    }
                />
            )}

            {tab === "itinerary" && (
                <div className="tour-section">
                    <div className="tour-section-heading">
                        <div>
                            <h3>Tour Itinerary</h3>
                            <p>
                                Plan your daily schedule and activities.
                            </p>
                        </div>

                        <span className="tour-count">
                            {data.itineraryDays.length} days
                        </span>
                    </div>

                    {data.itineraryDays.length === 0 && (
                        <div className="tour-empty">
                            <i className="bi bi-calendar-week" />
                            <p>No itinerary days added yet.</p>
                            <span>
                                Start by adding your first tour day.
                            </span>
                        </div>
                    )}

                    {data.itineraryDays.map((day, index) => (
                        <div className="tour-day-card" key={index}>
                            <div className="tour-day-header">
                                <div className="tour-day-title">
                                    <span className="tour-day-icon">
                                        <i className="bi bi-calendar-event" />
                                    </span>

                                    <div>
                                        <span>ITINERARY</span>
                                        <h3>
                                            Day {day.dayNumber ?? index + 1}
                                        </h3>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="tour-remove-btn"
                                    onClick={() =>
                                        setList(
                                            "itineraryDays",
                                            data.itineraryDays.filter(
                                                (_, i) => i !== index
                                            )
                                        )
                                    }
                                >
                                    <i className="bi bi-trash3" />
                                    Remove day
                                </button>
                            </div>

                            <div className="tour-form-grid">
                                {DAY_FIELDS.map((field) => (
                                    <FieldInput
                                        key={field.key}
                                        def={field}
                                        value={
                                            (
                                                day as Record<
                                                    string,
                                                    any
                                                >
                                            )[field.key]
                                        }
                                        searchHint={
                                            day.overnightCity ||
                                            day.title ||
                                            ""
                                        }
                                        onChange={(value) =>
                                            updateDay(index, {
                                                [field.key]: value,
                                            })
                                        }
                                    />
                                ))}
                            </div>

                            <div className="tour-activities">
                                <RowsEditor
                                    title={`Day ${day.dayNumber ?? index + 1} Activities`}
                                    itemLabel="activity"
                                    rows={day.activities ?? []}
                                    fields={ACTIVITY_FIELDS}
                                    newRow={() => ({
                                        activityName: "",
                                        activityType: "SIGHTSEEING",
                                        included: true,
                                        optional: false,
                                    })}
                                    onChange={(rows) =>
                                        updateDay(index, {
                                            activities: rows,
                                        })
                                    }
                                />
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        className="tour-add-btn"
                        onClick={addDay}
                    >
                        <i className="bi bi-plus-lg" />
                        Add itinerary day
                    </button>
                </div>
            )}

            {tab === "inclusions" && (
                <RowsEditor
                    title="Tour Inclusions"
                    itemLabel="inclusion"
                    rows={data.inclusions}
                    fields={TEXT_ITEM_FIELDS}
                    newRow={() => ({
                        description: "",
                    })}
                    onChange={(rows) =>
                        setList("inclusions", rows)
                    }
                />
            )}

            {tab === "exclusions" && (
                <RowsEditor
                    title="Tour Exclusions"
                    itemLabel="exclusion"
                    rows={data.exclusions}
                    fields={TEXT_ITEM_FIELDS}
                    newRow={() => ({
                        description: "",
                    })}
                    onChange={(rows) =>
                        setList("exclusions", rows)
                    }
                />
            )}

            {tab === "optional" && (
                <RowsEditor
                    title="Optional Activities"
                    itemLabel="optional activity"
                    rows={data.optionalActivities}
                    fields={OPTIONAL_ACTIVITY_FIELDS}
                    newRow={() => ({
                        activityName: "",
                        active: true,
                    })}
                    onChange={(rows) =>
                        setList("optionalActivities", rows)
                    }
                />
            )}

            {tab === "pricing" && (
                <RowsEditor
                    title="Tour Pricing"
                    itemLabel="price rule"
                    rows={data.priceRules}
                    fields={PRICE_FIELDS}
                    newRow={() => ({
                        passengerCategory: "ADULT",
                        roomCategory: "DOUBLE",
                        currency: data.tourPackage.currency ?? "",
                    })}
                    onChange={(rows) =>
                        setList("priceRules", rows)
                    }
                />
            )}


            {tab === "media" && (
                <div className="tour-section tour-media-section">
                    <div className="tour-section-heading">
                        <div>
                            <h3>Tour Gallery Images</h3>
                            <p>
                                Upload multiple images for your tour gallery.
                            </p>
                        </div>

                        <span className="tour-count">
                            {data.media.filter((item) => Boolean(item.fileUrl)).length} images
                        </span>
                    </div>

                    <ImageUploadWithSearch
                        label="Upload Tour Gallery Images"
                        searchHint={data.tourPackage.tourName ?? ""}
                        value={data.media
                            .map((item) => item.fileUrl)
                            .filter((url): url is string => Boolean(url))}
                        multiple={true}
                        onChange={(value) => {
                            const urls: string[] = Array.isArray(value)
                                ? value.filter(Boolean)
                                : value
                                    ? [value]
                                    : [];

                            const updatedMedia: TourMedia[] = urls.map(
                                (url, index) => {
                                    const existing = data.media.find(
                                        (item) => item.fileUrl === url
                                    );

                                    return {
                                        ...existing,
                                        mediaType: "IMAGE",
                                        fileName:
                                            existing?.fileName ||
                                            url.split("/").pop() ||
                                            `image-${index + 1}`,
                                        fileUrl: url,
                                        sequenceNumber: index + 1,
                                    };
                                }
                            );

                            setList("media", updatedMedia);
                        }}
                    />
                </div>
            )}


            {error && (
                <div className="tour-error">
                    <i className="bi bi-exclamation-circle-fill" />
                    <span>{error}</span>
                </div>
            )}


            <div className="tour-form-footer">
                <div className="tour-footer-info">
                    <i className="bi bi-shield-check" />
                    Your tour information will be saved securely.
                </div>

                <button
                    type="submit"
                    className="tour-submit-btn"
                    disabled={saving}
                >
                    {saving ? (
                        <>
                            <span className="tour-spinner" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <i className="bi bi-check2-circle" />
                            {submitLabel}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}