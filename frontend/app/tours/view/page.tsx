
"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { tourPackageService } from "../../apiservice/tourservice";
import { TourPackageFull } from "../../types/tour";
import { getSelectedTourId } from "../../utils/tourStorage";
import Breadcrumb from "@/app/component/BreadCrumb";
import "./tour-view.css";

function Section({
    title,
    count,
    children,
}: {
    title: string;
    count?: number;
    children: ReactNode;
}) {
    return (
        <section className="tour-view-section">
            <h3 className="tour-section-title">
                {title}
                {count !== undefined && (
                    <span className="tour-section-count">{count}</span>
                )}
            </h3>
            {children}
        </section>
    );
}

function Table({
    head,
    rows,
}: {
    head: string[];
    rows: ReactNode[][];
}) {
    if (rows.length === 0) {
        return <p className="tour-empty">None added.</p>;
    }

    return (
        <div className="tour-table-wrapper">
            <table className="tour-view-table">
                <thead>
                    <tr>
                        {head.map((h) => (
                            <th key={h}>{h}</th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {rows.map((r, i) => (
                        <tr key={i}>
                            {r.map((c, j) => (
                                <td key={j}>{c ?? "-"}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const dt = (v?: string | null) =>
    v ? v.replace("T", " ").slice(0, 16) : "-";

export default function ViewTourPage() {
    const router = useRouter();

    const [tour, setTour] = useState<TourPackageFull | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const stored = getSelectedTourId();

        if (!stored) {
            router.replace("/tours");
            return;
        }

        const load = async () => {
            try {
                const response = await tourPackageService.getFull(stored);
                setTour(response);
            } catch (e) {
                setError("Failed to load tour");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [router]);

    if (loading) {
        return (
            <div className="tour-loading">
                <div className="tour-spinner"></div>
                <p>Loading tour details...</p>
            </div>
        );
    }

    if (error || !tour) {
        return (
            <div className="tour-error">
                {error || "Tour not found"}
            </div>
        );
    }

    const p = tour.tourPackage;

    return (
        <div className="tour-view-page">

            <Breadcrumb
                items={[
                    { label: "Home", href: "/" },
                    { label: "Tours", href: "/tours" },
                    { label: p.tourName },
                ]}
            />

            <div className="tour-view-header">
                <div>
                    <h2>
                        {p.tourName}
                        {p.tourCode && (
                            <span className="tour-code">
                                {p.tourCode}
                            </span>
                        )}
                    </h2>
                    <p className="tour-header-subtitle">
                        Complete tour package information
                    </p>
                </div>

                <button
                    className="tour-edit-btn"
                    onClick={() => router.push("/tours/edit")}
                >
                    <i className="bi bi-pencil-square"></i>
                    Edit Tour
                </button>
            </div>

            <div className="tour-summary">

                <div className="tour-summary-item">
                    <i className="bi bi-calendar-range"></i>
                    <div>
                        <span>Duration</span>
                        <strong>
                            {p.durationDays != null
                                ? `${p.durationDays} Days / ${p.durationNights ?? 0} Nights`
                                : "-"}
                        </strong>
                    </div>
                </div>

                <div className="tour-summary-item">
                    <i className="bi bi-flag"></i>
                    <div>
                        <span>Status</span>
                        <strong>{p.status || "-"}</strong>
                    </div>
                </div>

                <div className="tour-summary-item">
                    <i className="bi bi-calendar-event"></i>
                    <div>
                        <span>Start Date</span>
                        <strong>{p.startDate || "-"}</strong>
                    </div>
                </div>

                <div className="tour-summary-item">
                    <i className="bi bi-calendar-check"></i>
                    <div>
                        <span>End Date</span>
                        <strong>{p.endDate || "-"}</strong>
                    </div>
                </div>

                <div className="tour-summary-item">
                    <i className="bi bi-people"></i>
                    <div>
                        <span>Travellers</span>
                        <strong>
                            {p.minimumTravellers ?? "-"} – {p.maximumTravellers ?? "-"}
                        </strong>
                    </div>
                </div>

                <div className="tour-summary-item">
                    <i className="bi bi-currency-exchange"></i>
                    <div>
                        <span>Currency</span>
                        <strong>{p.currency || "-"}</strong>
                    </div>
                </div>

            </div>

            {p.description && (
                <div className="tour-description-card">
                    <h4>About This Tour</h4>
                    <p>{p.description}</p>
                </div>
            )}

            <Section title="Destinations" count={tour.destinations.length}>
                <Table
                    head={["#", "Country", "City", "Description"]}
                    rows={tour.destinations.map((d) => [
                        d.sequenceNumber,
                        d.countryName,
                        d.cityName,
                        d.description,
                    ])}
                />
            </Section>

            <Section title="Flights" count={tour.flights.length}>
                <Table
                    head={[
                        "Type",
                        "Airline",
                        "Flight",
                        "From",
                        "To",
                        "Departure",
                        "Arrival",
                        "Baggage",
                    ]}
                    rows={tour.flights.map((f) => [
                        f.flightType,
                        f.airlineName,
                        f.flightNumber,
                        f.departureAirport,
                        f.arrivalAirport,
                        dt(f.departureDateTime),
                        dt(f.arrivalDateTime),
                        [f.baggageAllowance, f.cabinBaggage]
                            .filter(Boolean)
                            .join(" / ") || "-",
                    ])}
                />
            </Section>

            <Section title="Hotels" count={tour.hotels.length}>
                <Table
                    head={[
                        "City",
                        "Hotel",
                        "Category",
                        "Check-in",
                        "Check-out",
                        "Nights",
                        "Contact",
                    ]}
                    rows={tour.hotels.map((h) => [
                        h.cityName,
                        h.hotelName,
                        h.hotelCategory,
                        h.checkInDate,
                        h.checkOutDate,
                        h.numberOfNights,
                        h.contactNumber,
                    ])}
                />
            </Section>

            <Section title="Itinerary" count={tour.itineraryDays.length}>

                {tour.itineraryDays.length === 0 && (
                    <p className="tour-empty">None added.</p>
                )}

                <div className="itinerary-list">
                    {tour.itineraryDays.map((d) => (
                        <div className="itinerary-card" key={d.id}>

                            <div className="itinerary-heading">
                                <span className="itinerary-day-number">
                                    Day {d.dayNumber}
                                </span>

                                <strong>
                                    {d.title || "Daily Activities"}
                                </strong>

                                {d.tourDate && (
                                    <span className="itinerary-date">
                                        <i className="bi bi-calendar3"></i>
                                        {d.tourDate}
                                    </span>
                                )}
                            </div>

                            <div className="itinerary-meta">
                                <span>
                                    <i className="bi bi-geo-alt"></i>
                                    Overnight: {d.overnightCity ?? "-"}
                                </span>

                                <span>
                                    <i className="bi bi-cup-hot"></i>
                                    Meals: {d.mealPlan ?? "-"}
                                </span>
                            </div>

                            {d.description && (
                                <p className="itinerary-description">
                                    {d.description}
                                </p>
                            )}

                            {(d.activities ?? []).length > 0 && (
                                <div className="itinerary-activities">
                                    <h5>Activities</h5>

                                    <Table
                                        head={[
                                            "Activity",
                                            "Type",
                                            "Included",
                                            "Optional",
                                            "Extra Price",
                                        ]}
                                        rows={(d.activities ?? []).map((a) => [
                                            a.activityName,
                                            a.activityType,
                                            a.included ? "Yes" : "No",
                                            a.optional ? "Yes" : "No",
                                            a.additionalPrice != null
                                                ? `${a.additionalPrice} ${a.currency ?? ""}`
                                                : "-",
                                        ])}
                                    />
                                </div>
                            )}

                        </div>
                    ))}
                </div>
            </Section>

            <Section title="Inclusions" count={tour.inclusions.length}>
                {tour.inclusions.length === 0 ? (
                    <p className="tour-empty">None added.</p>
                ) : (
                    <ul className="tour-view-list tour-inclusion-list">
                        {tour.inclusions.map((i) => (
                            <li key={i.id}>{i.description}</li>
                        ))}
                    </ul>
                )}
            </Section>

            <Section title="Exclusions" count={tour.exclusions.length}>
                {tour.exclusions.length === 0 ? (
                    <p className="tour-empty">None added.</p>
                ) : (
                    <ul className="tour-view-list tour-exclusion-list">
                        {tour.exclusions.map((e) => (
                            <li key={e.id}>{e.description}</li>
                        ))}
                    </ul>
                )}
            </Section>

            <Section
                title="Optional Activities"
                count={tour.optionalActivities.length}
            >
                <Table
                    head={[
                        "Activity",
                        "Price",
                        "Availability",
                        "Active",
                    ]}
                    rows={tour.optionalActivities.map((o) => [
                        o.activityName,
                        o.price != null
                            ? `${o.price} ${o.currency ?? ""}`
                            : "-",
                        o.availabilityType,
                        o.active ? "Yes" : "No",
                    ])}
                />
            </Section>

            <Section title="Pricing" count={tour.priceRules.length}>
                <Table
                    head={[
                        "Passenger",
                        "Room",
                        "Price",
                        "Valid From",
                        "Valid Until",
                        "Remarks",
                    ]}
                    rows={tour.priceRules.map((r) => [
                        r.passengerCategory,
                        r.roomCategory,
                        r.price != null
                            ? `${r.price} ${r.currency ?? ""}`
                            : "-",
                        r.validFrom,
                        r.validUntil,
                        r.remarks,
                    ])}
                />
            </Section>

            <Section title="Media" count={tour.media.length}>
                <Table
                    head={["#", "Type", "File", "Caption"]}
                    rows={tour.media.map((m) => [
                        m.sequenceNumber,
                        m.mediaType,
                        m.fileUrl ? (
                            <a
                                key={m.id}
                                href={m.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <i className="bi bi-file-earmark-arrow-down"></i>
                                {" "}{m.fileName ?? m.fileUrl}
                            </a>
                        ) : (
                            m.fileName
                        ),
                        m.caption,
                    ])}
                />
            </Section>

        </div>
    );
}
