
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { tourPackageService } from "../../apiservice/tourservice";
import {
    TourPackageFull,
    TourHotel,
    TourMedia,
} from "../../types/tour";
import { getSelectedTourId } from "../../utils/tourStorage";
import "./tour-details.css";

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

const imageUrl = (url?: string | null) => {
    if (!url) return "";
    if (/^(https?:\/\/|data:)/i.test(url)) return url;

    return `${API_BASE.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
};

const formatDate = (value?: string | null) => {
    if (!value) return "-";

    const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatDateTime = (value?: string | null) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const money = (
    amount?: number | null,
    currency?: string | null
) => {
    if (amount == null || !Number.isFinite(Number(amount))) {
        return "Price on request";
    }

    return `${currency || "INR"} ${Number(amount).toLocaleString("en-IN")}`;
};

const isImage = (media: TourMedia) => {
    const url = media.fileUrl || "";
    const type = media.mediaType?.toUpperCase();

    return (
        type === "IMAGE" ||
        /\.(jpg|jpeg|png|webp|gif|avif)(\?.*)?$/i.test(url)
    );
};

const isVideo = (media: TourMedia) => {
    const url = media.fileUrl || "";
    const type = media.mediaType?.toUpperCase();

    return (
        type === "VIDEO" ||
        /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)
    );
};

const isDirectVideo = (url: string) =>
    /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);

function TourDetails() {
    const router = useRouter();

    const [tour, setTour] = useState<TourPackageFull | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeImage, setActiveImage] = useState("");
    const [hotelImages, setHotelImages] = useState<Record<number, number>>({});

    useEffect(() => {
        const selectedId = getSelectedTourId();

        if (!selectedId) {
            router.replace("/tours");
            return;
        }

        const loadTour = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await tourPackageService.getFull(selectedId);

                const data = response;

                if (!data || !data.tourPackage) {
                    throw new Error("Invalid tour response");
                }

                setTour(data);

                const firstMediaImage = (data.media || []).find(
                    (media) => media.fileUrl && isImage(media)
                );

                const initialImage =
                    data.tourPackage.coverImageUrl ||
                    firstMediaImage?.fileUrl ||
                    "";

                setActiveImage(imageUrl(initialImage));

                const initialHotelImages: Record<number, number> = {};

                (data.hotels || []).forEach((hotel) => {
                    if (hotel.id != null) {
                        initialHotelImages[hotel.id] = 0;
                    }
                });

                setHotelImages(initialHotelImages);
            } catch (err) {
                console.error("Tour loading error:", err);
                setError("Unable to load tour details. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        loadTour();
    }, [router]);

    const p = tour?.tourPackage;

    const gallery = useMemo(() => {
        if (!tour) return [];

        const items: {
            id: string;
            url: string;
            caption: string;
        }[] = [];

        if (p?.coverImageUrl) {
            items.push({
                id: "cover",
                url: imageUrl(p.coverImageUrl),
                caption: "Tour cover image",
            });
        }

        tour.media
            .filter((media) => media.fileUrl && isImage(media))
            .forEach((media) => {
                const url = imageUrl(media.fileUrl);

                if (!items.some((item) => item.url === url)) {
                    items.push({
                        id: `media-${media.id}`,
                        url,
                        caption:
                            media.caption ||
                            media.fileName ||
                            "Tour image",
                    });
                }
            });

        return items;
    }, [tour, p]);

    const destinations = [...(tour?.destinations || [])].sort(
        (a, b) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0)
    );

    const itinerary = [...(tour?.itineraryDays || [])].sort(
        (a, b) => (a.dayNumber || 0) - (b.dayNumber || 0)
    );

    const flights = tour?.flights || [];
    const hotels = tour?.hotels || [];
    const inclusions = tour?.inclusions || [];
    const exclusions = tour?.exclusions || [];
    const optionalActivities = tour?.optionalActivities || [];
    const priceRules = tour?.priceRules || [];
    const media = tour?.media || [];

    const documents = media.filter(
        (item) => item.fileUrl && !isImage(item) && !isVideo(item)
    );

    const videos = media.filter(
        (item) => item.fileUrl && isVideo(item)
    );

    const startingPrice = priceRules
        .map((rule) => Number(rule.price))
        .filter((price) => Number.isFinite(price) && price > 0)
        .sort((a, b) => a - b)[0];

    const selectHotelImage = (hotelId: number, index: number) => {
        setHotelImages((prev) => ({
            ...prev,
            [hotelId]: index,
        }));
    };

    const scrollToBooking = () => {
        document
            .getElementById("td-booking")
            ?.scrollIntoView({ behavior: "smooth" });
    };

    if (loading) {
        return (
            <div className="td-loading">
                <div className="td-spinner" />
                <h3>Preparing your tour experience</h3>
                <p>Please wait while we load all tour details.</p>
            </div>
        );
    }

    if (error || !tour || !p) {
        return (
            <div className="td-error">
                <i className="bi bi-exclamation-circle" />
                <h3>Tour not available</h3>
                <p>{error || "We couldn't find this tour package."}</p>
                <button onClick={() => router.push("/tours")}>
                    Explore Tours
                </button>
            </div>
        );
    }

    const coverImage = activeImage || gallery[0]?.url;

    return (
        <div className="td-site">


            <header className="td-header">
                <div className="td-header-inner">
                    <div className="td-logo">
                        <span className="td-logo-icon">
                            <i className="bi bi-airplane-fill"></i>
                        </span>

                        <div className="td-logo-content">
                            <span className="td-logo-name">
                                Travel<span>World</span>
                            </span>
                            <small>DISCOVER. EXPLORE. EXPERIENCE.</small>
                        </div>
                    </div>

                    <div className="td-header-tagline">
                        <i className="bi bi-globe-americas"></i>
                        <span>Your journey begins here</span>
                    </div>
                </div>
            </header>

            <main className="td-page">



                <section className="td-hero">

                    <div className="td-hero-image">

                        {coverImage ? (
                            <img
                                src={coverImage}
                                alt={p.tourName}
                            />
                        ) : (
                            <div className="td-no-image">
                                <i className="bi bi-image" />
                                <span>Explore your next destination</span>
                            </div>
                        )}

                        <div className="td-hero-overlay" />

                        <div className="td-hero-content">

                            <span className="td-eyebrow">
                                <i className="bi bi-airplane" />
                                YOUR NEXT ADVENTURE
                            </span>

                            <h1>{p.tourName}</h1>

                            <p>
                                <i className="bi bi-geo-alt-fill" />
                                {destinations
                                    .map((d) => d.cityName || d.countryName)
                                    .filter(Boolean)
                                    .join(" · ") ||
                                    "Discover beautiful destinations"}
                            </p>

                            {p.status && (
                                <span className="td-status">
                                    {p.status}
                                </span>
                            )}

                        </div>
                    </div>


                    {gallery.length > 0 && (
                        <div className="td-gallery">
                            {gallery.map((image) => (
                                <button
                                    key={image.id}
                                    className={`td-gallery-item ${activeImage === image.url ? "active" : ""
                                        }`}
                                    onClick={() => setActiveImage(image.url)}
                                    aria-label={`View ${image.caption}`}
                                >
                                    <img
                                        src={image.url}
                                        alt={image.caption}
                                    />
                                </button>
                            ))}
                        </div>
                    )}

                </section>

                <div className="td-layout">

                    <div className="td-main">


                        <section className="td-overview td-section">

                            <div className="td-section-heading">
                                <div>
                                    <span className="td-small-label">
                                        DISCOVER
                                    </span>
                                    <h2>About This Tour</h2>
                                </div>

                                {p.tourCode && (
                                    <span className="td-tour-code">
                                        {p.tourCode}
                                    </span>
                                )}
                            </div>

                            <p className="td-description">
                                {p.description ||
                                    "Discover amazing destinations and create unforgettable memories."}
                            </p>

                            <div className="td-highlights">

                                <div>
                                    <i className="bi bi-calendar2-week" />
                                    <span>Duration</span>
                                    <strong>
                                        {p.durationDays ?? "-"} Days /{" "}
                                        {p.durationNights ?? 0} Nights
                                    </strong>
                                </div>

                                <div>
                                    <i className="bi bi-people" />
                                    <span>Group Size</span>
                                    <strong>
                                        {p.minimumTravellers ?? "-"} -{" "}
                                        {p.maximumTravellers ?? "-"} People
                                    </strong>
                                </div>

                                <div>
                                    <i className="bi bi-calendar-event" />
                                    <span>Start Date</span>
                                    <strong>{formatDate(p.startDate)}</strong>
                                </div>

                                <div>
                                    <i className="bi bi-calendar-check" />
                                    <span>End Date</span>
                                    <strong>{formatDate(p.endDate)}</strong>
                                </div>

                            </div>

                            <div className="td-extra-meta">
                                <span>
                                    Tour Code: <strong>{p.tourCode || "-"}</strong>
                                </span>
                                <span>
                                    Currency: <strong>{p.currency || "INR"}</strong>
                                </span>
                                <span>
                                    Created: <strong>{formatDate(p.createdAt)}</strong>
                                </span>
                                <span>
                                    Last Updated: <strong>{formatDate(p.updatedAt)}</strong>
                                </span>
                            </div>

                        </section>


                        {destinations.length > 0 && (
                            <section className="td-section" id="destinations">

                                <div className="td-section-heading">
                                    <div>
                                        <span className="td-small-label">
                                            WHERE YOU WILL GO
                                        </span>
                                        <h2>Explore Destinations</h2>
                                    </div>

                                    <span className="td-count">
                                        {destinations.length} Places
                                    </span>
                                </div>

                                <div className="td-destinations">
                                    {destinations.map((destination, index) => (
                                        <article
                                            className="td-destination td-destination-full"
                                            key={destination.id ?? index}
                                        >
                                            <div className="td-destination-image">
                                                {destination.imageUrl ? (
                                                    <img
                                                        src={imageUrl(destination.imageUrl)}
                                                        alt={destination.cityName || "Destination"}
                                                    />
                                                ) : (
                                                    <div className="td-destination-placeholder">
                                                        <span>{String(index + 1).padStart(2, "0")}</span>
                                                    </div>
                                                )}

                                                <span className="td-destination-number">
                                                    {String(index + 1).padStart(2, "0")}
                                                </span>
                                            </div>

                                            <div className="td-destination-content">
                                                <small>
                                                    STOP {destination.sequenceNumber ?? index + 1}
                                                </small>

                                                <h4>
                                                    {destination.cityName ||
                                                        destination.countryName ||
                                                        "Destination"}
                                                </h4>

                                                {destination.countryName && (
                                                    <span className="td-destination-country">
                                                        {destination.countryName}
                                                    </span>
                                                )}

                                                {destination.description && (
                                                    <p>{destination.description}</p>
                                                )}
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </section>
                        )}


                        <section className="td-section" id="itinerary">

                            <div className="td-section-heading">
                                <div>
                                    <span className="td-small-label">
                                        YOUR JOURNEY
                                    </span>
                                    <h2>Tour Itinerary</h2>
                                </div>
                                <span className="td-count">
                                    {itinerary.length} Days
                                </span>
                            </div>

                            {itinerary.length === 0 ? (
                                <p className="td-empty">
                                    Itinerary details coming soon.
                                </p>
                            ) : (
                                <div className="td-itinerary">

                                    {itinerary.map((day, index) => (
                                        <article
                                            className="td-day-card"
                                            key={day.id ?? index}
                                        >

                                            <div className="td-day-marker">
                                                <span>DAY</span>
                                                <strong>{day.dayNumber ?? index + 1}</strong>
                                            </div>

                                            <div className="td-day-content">

                                                <div className="td-day-heading">
                                                    <div>
                                                        <h3>
                                                            {day.title || "Daily Activities"}
                                                        </h3>

                                                        <span>
                                                            <i className="bi bi-calendar3" />
                                                            {" "}
                                                            {formatDate(day.tourDate)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {day.description && (
                                                    <p className="td-day-description">
                                                        {day.description}
                                                    </p>
                                                )}

                                                <div className="td-day-info">

                                                    <span>
                                                        <i className="bi bi-geo-alt" />
                                                        Overnight: {day.overnightCity || "-"}
                                                    </span>

                                                    <span>
                                                        <i className="bi bi-cup-hot" />
                                                        Meals: {day.mealPlan || "-"}
                                                    </span>

                                                </div>

                                                <div className="td-activities">

                                                    <h4>
                                                        <i className="bi bi-stars" />
                                                        Activities
                                                    </h4>

                                                    {(day.activities || []).length === 0 ? (
                                                        <p className="td-empty">
                                                            No activities added for this day.
                                                        </p>
                                                    ) : (
                                                        day.activities?.map((activity, activityIndex) => (
                                                            <div
                                                                className="td-activity"
                                                                key={activity.id ?? activityIndex}
                                                            >

                                                                <div className="td-activity-name">
                                                                    <strong>
                                                                        {activity.activityName || "Activity"}
                                                                    </strong>

                                                                    {activity.activityType && (
                                                                        <span>
                                                                            {activity.activityType}
                                                                        </span>
                                                                    )}

                                                                    {activity.description && (
                                                                        <p>{activity.description}</p>
                                                                    )}
                                                                </div>

                                                                <div className="td-activity-tags">

                                                                    {activity.included && (
                                                                        <span className="td-included-tag">
                                                                            Included
                                                                        </span>
                                                                    )}

                                                                    {activity.optional && (
                                                                        <span className="td-optional-tag">
                                                                            Optional
                                                                        </span>
                                                                    )}

                                                                    {activity.additionalPrice != null && (
                                                                        <span className="td-activity-price">
                                                                            {money(
                                                                                activity.additionalPrice,
                                                                                activity.currency
                                                                            )}
                                                                        </span>
                                                                    )}

                                                                </div>

                                                            </div>
                                                        ))
                                                    )}

                                                </div>

                                            </div>
                                        </article>
                                    ))}

                                </div>
                            )}

                        </section>


                        {hotels.length > 0 && (
                            <section className="td-section" id="hotels">

                                <div className="td-section-heading">
                                    <div>
                                        <span className="td-small-label">
                                            YOUR STAY
                                        </span>
                                        <h2>Accommodation</h2>
                                    </div>
                                    <span className="td-count">
                                        {hotels.length} Hotels
                                    </span>
                                </div>

                                <div className="td-hotel-grid">

                                    {hotels.map((hotel, index) => {
                                        const images = (hotel.images || []).filter(Boolean);
                                        const activeIndex = hotelImages[hotel.id ?? index] || 0;

                                        const currentImage =
                                            images.length > 0
                                                ? imageUrl(images[activeIndex] || images[0])
                                                : "";

                                        return (
                                            <article
                                                className="td-hotel-card"
                                                key={hotel.id ?? index}
                                            >


                                                <div className="td-hotel-image">

                                                    {currentImage ? (
                                                        <img
                                                            src={currentImage}
                                                            alt={hotel.hotelName || "Hotel"}
                                                        />
                                                    ) : (
                                                        <div className="td-hotel-placeholder">
                                                            <i className="bi bi-building" />
                                                            <span>No hotel image available</span>
                                                        </div>
                                                    )}

                                                    {images.length > 1 && (
                                                        <>
                                                            <button
                                                                className="td-hotel-arrow td-hotel-prev"
                                                                onClick={() =>
                                                                    selectHotelImage(
                                                                        hotel.id ?? index,
                                                                        (activeIndex - 1 + images.length) % images.length
                                                                    )
                                                                }
                                                                aria-label="Previous hotel image"
                                                            >
                                                                <i className="bi bi-chevron-left" />
                                                            </button>

                                                            <button
                                                                className="td-hotel-arrow td-hotel-next"
                                                                onClick={() =>
                                                                    selectHotelImage(
                                                                        hotel.id ?? index,
                                                                        (activeIndex + 1) % images.length
                                                                    )
                                                                }
                                                                aria-label="Next hotel image"
                                                            >
                                                                <i className="bi bi-chevron-right" />
                                                            </button>
                                                        </>
                                                    )}

                                                    {hotel.hotelCategory && (
                                                        <span className="td-hotel-badge">
                                                            {hotel.hotelCategory}
                                                        </span>
                                                    )}

                                                </div>

                                                {images.length > 1 && (
                                                    <div className="td-hotel-thumbnails">
                                                        {images.map((image, imageIndex) => (
                                                            <button
                                                                key={`${hotel.id}-${imageIndex}`}
                                                                className={
                                                                    activeIndex === imageIndex
                                                                        ? "active"
                                                                        : ""
                                                                }
                                                                onClick={() =>
                                                                    selectHotelImage(
                                                                        hotel.id ?? index,
                                                                        imageIndex
                                                                    )
                                                                }
                                                            >
                                                                <img
                                                                    src={imageUrl(image)}
                                                                    alt={`Hotel ${imageIndex + 1}`}
                                                                />
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="td-hotel-body">

                                                    <span className="td-hotel-city">
                                                        <i className="bi bi-geo-alt" />
                                                        {hotel.cityName || "Location"}
                                                    </span>

                                                    <h3>{hotel.hotelName || "Hotel"}</h3>

                                                    <p>{hotel.hotelCategory || "Accommodation"}</p>

                                                    <div className="td-hotel-details">

                                                        <span>
                                                            <small>Check-in</small>
                                                            <strong>{formatDate(hotel.checkInDate)}</strong>
                                                        </span>

                                                        <span>
                                                            <small>Check-out</small>
                                                            <strong>{formatDate(hotel.checkOutDate)}</strong>
                                                        </span>

                                                        <span>
                                                            <small>Nights</small>
                                                            <strong>{hotel.numberOfNights ?? "-"}</strong>
                                                        </span>

                                                    </div>

                                                    {hotel.address && (
                                                        <div className="td-hotel-extra">
                                                            <i className="bi bi-pin-map" />
                                                            {hotel.address}
                                                        </div>
                                                    )}

                                                    {hotel.contactNumber && (
                                                        <div className="td-hotel-extra">
                                                            <i className="bi bi-telephone" />
                                                            {hotel.contactNumber}
                                                        </div>
                                                    )}

                                                    {hotel.remarks && (
                                                        <p className="td-hotel-remarks">
                                                            {hotel.remarks}
                                                        </p>
                                                    )}

                                                    <div className="td-hotel-image-count">
                                                        <i className="bi bi-images" />
                                                        {images.length} Hotel Images
                                                    </div>

                                                </div>
                                            </article>
                                        );
                                    })}

                                </div>
                            </section>
                        )}


                        {flights.length > 0 && (
                            <section className="td-section" id="flights">

                                <div className="td-section-heading">
                                    <div>
                                        <span className="td-small-label">
                                            GETTING THERE
                                        </span>
                                        <h2>Flight Details</h2>
                                    </div>
                                    <span className="td-count">
                                        {flights.length} Flights
                                    </span>
                                </div>

                                <div className="td-flight-list">

                                    {flights.map((flight, index) => (
                                        <article
                                            className="td-flight-card"
                                            key={flight.id ?? index}
                                        >

                                            <div className="td-flight-top">
                                                <span>{flight.flightType || "Flight"}</span>
                                                <span>{flight.airlineName || "Airline"}</span>
                                                <span>{flight.flightNumber || "-"}</span>
                                            </div>

                                            <div className="td-flight-route">

                                                <div>
                                                    <strong>
                                                        {flight.departureAirport || "-"}
                                                    </strong>
                                                    <span>
                                                        {formatDateTime(flight.departureDateTime)}
                                                    </span>
                                                </div>

                                                <div className="td-flight-line">
                                                    <i className="bi bi-airplane" />
                                                    <span />
                                                </div>

                                                <div>
                                                    <strong>
                                                        {flight.arrivalAirport || "-"}
                                                    </strong>
                                                    <span>
                                                        {formatDateTime(flight.arrivalDateTime)}
                                                    </span>
                                                </div>

                                            </div>

                                            <div className="td-baggage">
                                                <span>
                                                    <i className="bi bi-luggage" />
                                                    Check-in baggage: {flight.baggageAllowance || "-"}
                                                </span>

                                                <span>
                                                    <i className="bi bi-bag" />
                                                    Cabin baggage: {flight.cabinBaggage || "-"}
                                                </span>
                                            </div>

                                            {flight.remarks && (
                                                <p className="td-flight-remarks">
                                                    {flight.remarks}
                                                </p>
                                            )}

                                        </article>
                                    ))}

                                </div>
                            </section>
                        )}


                        <section className="td-section">

                            <div className="td-section-heading">
                                <div>
                                    <span className="td-small-label">
                                        KNOW BEFORE YOU GO
                                    </span>
                                    <h2>What's Included?</h2>
                                </div>
                            </div>

                            <div className="td-inclusion-grid">

                                <div className="td-inclusion-card">
                                    <h3>
                                        <i className="bi bi-check-circle-fill" />
                                        Inclusions
                                    </h3>

                                    {inclusions.length > 0 ? (
                                        <ul>
                                            {inclusions.map((item, index) => (
                                                <li key={item.id ?? index}>
                                                    <i className="bi bi-check2" />
                                                    {item.description}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="td-empty">
                                            No inclusions specified.
                                        </p>
                                    )}
                                </div>

                                <div className="td-exclusion-card">
                                    <h3>
                                        <i className="bi bi-x-circle-fill" />
                                        Exclusions
                                    </h3>

                                    {exclusions.length > 0 ? (
                                        <ul>
                                            {exclusions.map((item, index) => (
                                                <li key={item.id ?? index}>
                                                    <i className="bi bi-x" />
                                                    {item.description}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="td-empty">
                                            No exclusions specified.
                                        </p>
                                    )}
                                </div>

                            </div>
                        </section>


                        {optionalActivities.length > 0 && (
                            <section className="td-section">

                                <div className="td-section-heading">
                                    <div>
                                        <span className="td-small-label">
                                            MAKE IT SPECIAL
                                        </span>
                                        <h2>Optional Experiences</h2>
                                    </div>
                                </div>

                                <div className="td-optional-grid">

                                    {optionalActivities.map((activity, index) => (
                                        <article
                                            className="td-optional-card"
                                            key={activity.id ?? index}
                                        >
                                            <i className="bi bi-stars" />

                                            <h3>{activity.activityName}</h3>

                                            {activity.description && (
                                                <p>{activity.description}</p>
                                            )}

                                            <span>
                                                {activity.availabilityType || "Available on request"}
                                            </span>

                                            <strong>
                                                {money(
                                                    activity.price,
                                                    activity.currency || p.currency
                                                )}
                                            </strong>

                                            <small>
                                                Status: {activity.active ? "Active" : "Inactive"}
                                            </small>
                                        </article>
                                    ))}

                                </div>
                            </section>
                        )}


                        {priceRules.length > 0 && (
                            <section className="td-section" id="pricing">

                                <div className="td-section-heading">
                                    <div>
                                        <span className="td-small-label">
                                            PLAN YOUR BUDGET
                                        </span>
                                        <h2>Tour Pricing</h2>
                                    </div>
                                </div>

                                <div className="td-pricing-grid">

                                    {priceRules.map((rule, index) => (
                                        <article
                                            className="td-price-card"
                                            key={rule.id ?? index}
                                        >

                                            <span className="td-price-category">
                                                {rule.passengerCategory || "Passenger"}
                                            </span>

                                            <h3>
                                                {money(
                                                    rule.price,
                                                    rule.currency || p.currency
                                                )}
                                            </h3>

                                            <span className="td-room-category">
                                                <i className="bi bi-door-open" />
                                                {rule.roomCategory || "Room details on request"}
                                            </span>

                                            <div className="td-price-extra">
                                                <span>
                                                    Valid From:
                                                    <strong>{formatDate(rule.validFrom)}</strong>
                                                </span>

                                                <span>
                                                    Valid Until:
                                                    <strong>{formatDate(rule.validUntil)}</strong>
                                                </span>
                                            </div>

                                            {rule.remarks && (
                                                <p>{rule.remarks}</p>
                                            )}

                                        </article>
                                    ))}

                                </div>
                            </section>
                        )}


                        {videos.length > 0 && (
                            <section className="td-section">

                                <div className="td-section-heading">
                                    <div>
                                        <span className="td-small-label">
                                            WATCH AND EXPLORE
                                        </span>
                                        <h2>Tour Videos</h2>
                                    </div>
                                    <span className="td-count">
                                        {videos.length} Videos
                                    </span>
                                </div>

                                <div className="td-media-grid">

                                    {videos.map((video, index) => (
                                        <article
                                            className="td-media-card"
                                            key={video.id ?? index}
                                        >

                                            {isDirectVideo(video.fileUrl!) ? (
                                                <video
                                                    src={imageUrl(video.fileUrl)}
                                                    controls
                                                    preload="metadata"
                                                />
                                            ) : (
                                                <a
                                                    href={imageUrl(video.fileUrl)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="td-video-link"
                                                >
                                                    <i className="bi bi-play-circle-fill" />
                                                    Play Video
                                                </a>
                                            )}

                                            <div>
                                                <h4>
                                                    {video.caption ||
                                                        video.fileName ||
                                                        "Tour Video"}
                                                </h4>
                                                <span>{video.mediaType}</span>
                                            </div>

                                        </article>
                                    ))}

                                </div>
                            </section>
                        )}


                        {documents.length > 0 && (
                            <section className="td-section">

                                <div className="td-section-heading">
                                    <div>
                                        <span className="td-small-label">
                                            MORE INFORMATION
                                        </span>
                                        <h2>Tour Documents</h2>
                                    </div>
                                </div>

                                <div className="td-documents">

                                    {documents.map((document, index) => (
                                        <a
                                            href={imageUrl(document.fileUrl)}
                                            target="_blank"
                                            rel="noreferrer"
                                            key={document.id ?? index}
                                        >
                                            <i className="bi bi-file-earmark-arrow-down" />

                                            <span>
                                                <strong>
                                                    {document.caption ||
                                                        document.fileName ||
                                                        "View Document"}
                                                </strong>
                                                <small>
                                                    {document.mediaType || "Document"}
                                                </small>
                                            </span>

                                            <i className="bi bi-arrow-up-right" />
                                        </a>
                                    ))}

                                </div>
                            </section>
                        )}

                    </div>


                    <aside className="td-sidebar" id="td-booking">

                        <div className="td-booking-card">

                            <span className="td-booking-label">
                                YOUR NEXT ADVENTURE
                            </span>

                            <h3>Ready to Explore?</h3>

                            <p>
                                Make unforgettable memories. Get in touch
                                with our travel team for availability and
                                booking details.
                            </p>

                            <div className="td-booking-divider" />

                            <div className="td-booking-detail">
                                <i className="bi bi-ticket-perforated" />
                                <div>
                                    <span>Tour Code</span>
                                    <strong>{p.tourCode || "-"}</strong>
                                </div>
                            </div>

                            <div className="td-booking-detail">
                                <i className="bi bi-calendar-range" />
                                <div>
                                    <span>Duration</span>
                                    <strong>
                                        {p.durationDays ?? "-"} Days /{" "}
                                        {p.durationNights ?? 0} Nights
                                    </strong>
                                </div>
                            </div>

                            <div className="td-booking-detail">
                                <i className="bi bi-people" />
                                <div>
                                    <span>Travellers</span>
                                    <strong>
                                        {p.minimumTravellers ?? "-"} -{" "}
                                        {p.maximumTravellers ?? "-"} People
                                    </strong>
                                </div>
                            </div>

                            <div className="td-booking-detail">
                                <i className="bi bi-calendar-event" />
                                <div>
                                    <span>Tour Dates</span>
                                    <strong>{formatDate(p.startDate)}</strong>
                                </div>
                            </div>

                            <div className="td-booking-divider" />

                            <div className="td-booking-price">
                                <span>Starting Price</span>

                                <strong>
                                    {startingPrice != null
                                        ? money(startingPrice, p.currency || priceRules[0]?.currency)
                                        : "On Request"}
                                </strong>

                                <small>
                                    Final price depends on room and passenger category.
                                </small>
                            </div>

                           

                            <div className="td-trust-note">
                                <i className="bi bi-shield-check" />
                                <span>Personalised travel assistance</span>
                            </div>

                        </div>

                    </aside>

                </div>

            </main>


        </div>
    );
}

export default TourDetails;
