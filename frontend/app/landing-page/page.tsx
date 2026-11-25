
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { tourPackageService } from "../apiservice/tourservice";
import { TourPackage } from "../types/tour";
import "./landing-page.css";

function LandingPage() {
    const router = useRouter();

    const [tours, setTours] = useState<TourPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadTours = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await tourPackageService.getAll();
                setTours(data);
            } catch {
                setError("Failed to load tours. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        loadTours();
    }, []);

    const openTour = (tour: TourPackage) => {
        if (!tour.tourCode) {
            alert("Tour code is not available");
            return;
        }

        if (tour.id === undefined || tour.id === null) {
            alert("Tour package ID is not available");
            return;
        }

        localStorage.setItem(
            `tour-details/${tour.tourCode}`,
            String(tour.id)
        );

        router.push(
            `/tour-details/${encodeURIComponent(tour.tourCode)}`
        );
    };

    const scrollToTours = () => {
        document.getElementById("available-tours")?.scrollIntoView({
            behavior: "smooth",
        });
    };

    return (
        <main className="landing-page">
            <section className="landing-hero">

                <div className="landing-hero-overlay"></div>

                <div className="landing-hero-content">

                    <div className="landing-tag">
                        <i className="bi bi-globe-americas"></i>
                        EXPLORE THE WORLD
                    </div>

                    <h1>
                        Discover Your Next
                        <span> Adventure</span>
                    </h1>

                    <p>
                        Explore amazing destinations, discover unique
                        experiences and find the perfect tour package
                        for your next journey. Your unforgettable
                        adventure starts here.
                    </p>

                    <div className="landing-hero-actions">
                        <button
                            className="landing-explore-btn"
                            onClick={scrollToTours}
                        >
                            Explore Tours
                            <i className="bi bi-arrow-up-right"></i>
                        </button>

                        <button
                            className="landing-secondary-btn"
                            onClick={scrollToTours}
                        >
                            <i className="bi bi-compass"></i>
                            Discover Destinations
                        </button>
                    </div>

                    <div className="landing-hero-bottom">
                        <div className="landing-hero-bottom-icon">
                            <i className="bi bi-airplane"></i>
                        </div>

                        <div>
                            <strong>Make Every Journey Special</strong>
                            <span>Discover places. Create memories.</span>
                        </div>
                    </div>

                </div>
                <div className="landing-floating-card">
                    <div className="landing-floating-icon">
                        <i className="bi bi-map"></i>
                    </div>

                    <div>
                        <strong>{tours.length}+</strong>
                        <span>Tour Packages</span>
                    </div>
                </div>

                <div className="landing-scroll-indicator">
                    <span></span>
                    SCROLL TO EXPLORE
                </div>

            </section>
            <section className="landing-features">

                <div className="landing-feature">
                    <div className="landing-feature-icon">
                        <i className="bi bi-geo-alt"></i>
                    </div>

                    <div>
                        <h4>Amazing Destinations</h4>
                        <p>Explore beautiful places</p>
                    </div>
                </div>

                <div className="landing-feature">
                    <div className="landing-feature-icon">
                        <i className="bi bi-calendar-heart"></i>
                    </div>

                    <div>
                        <h4>Memorable Journeys</h4>
                        <p>Create lasting memories</p>
                    </div>
                </div>

                <div className="landing-feature">
                    <div className="landing-feature-icon">
                        <i className="bi bi-stars"></i>
                    </div>

                    <div>
                        <h4>Unique Experiences</h4>
                        <p>Every trip is special</p>
                    </div>
                </div>

            </section>
            <section
                className="landing-tours-section"
                id="available-tours"
            >

                <div className="landing-section-header">

                    <div className="landing-section-heading">

                        <span className="landing-section-label">
                            <span></span>
                            FIND YOUR JOURNEY
                        </span>

                        <h2>
                            Explore Our
                            <span> Tour Packages</span>
                        </h2>

                        <p>
                            Choose your destination and start planning
                            your next adventure. Discover exciting
                            journeys and unforgettable experiences.
                        </p>

                    </div>

                    <div className="landing-tour-count">
                        <i className="bi bi-globe2"></i>

                        <div>
                            <strong>{tours.length}</strong>
                            <span>Tours Available</span>
                        </div>
                    </div>

                </div>
                {loading && (
                    <div className="landing-loading">
                        <span className="landing-spinner"></span>
                        <h3>Discovering amazing journeys...</h3>
                        <p>Loading tour packages. Please wait.</p>
                    </div>
                )}
                {!loading && error && (
                    <div className="landing-error">
                        <i className="bi bi-exclamation-circle"></i>
                        <h3>Unable to Load Tours</h3>
                        <p>{error}</p>
                    </div>
                )}
                {!loading && !error && tours.length === 0 && (
                    <div className="landing-empty">
                        <div className="landing-empty-icon">
                            <i className="bi bi-map"></i>
                        </div>

                        <h3>No Tours Available</h3>

                        <p>
                            Exciting destinations will appear here.
                            Please check back later.
                        </p>
                    </div>
                )}
                {!loading && !error && tours.length > 0 && (
                    <div className="landing-tours-grid">

                        {tours.map((tour) => (
                            <article
                                className="landing-tour-card"
                                key={tour.id}
                                onClick={() => openTour(tour)}
                            >
                                <div className="landing-tour-image">

                                    {tour.coverImageUrl ? (
                                        <img
                                            src={tour.coverImageUrl}
                                            alt={tour.tourName || "Tour destination"}
                                            className="landing-tour-cover"
                                        />
                                    ) : (
                                        <div className="landing-tour-no-image">
                                            <i className="bi bi-globe-americas"></i>
                                        </div>
                                    )}

                                    <div className="landing-image-overlay"></div>

                                    <span className="landing-tour-status">
                                        {tour.status ?? "Draft"}
                                    </span>

                                    <span className="landing-tour-code">
                                        {tour.tourCode ?? "-"}
                                    </span>

                                </div>
                                <div className="landing-tour-content">

                                    <div className="landing-tour-title-row">
                                        <h3>{tour.tourName}</h3>

                                        <i className="bi bi-arrow-up-right"></i>
                                    </div>

                                    <p className="landing-tour-description">
                                        {tour.description ||
                                            "Discover this amazing tour package and explore new destinations."}
                                    </p>

                                    <div className="landing-tour-divider"></div>

                                    <div className="landing-tour-details">

                                        <div className="landing-tour-info">
                                            <i className="bi bi-moon-stars"></i>

                                            <span>
                                                {tour.durationDays ?? 0} Days /
                                                {" "}
                                                {tour.durationNights ?? 0} Nights
                                            </span>
                                        </div>

                                        <div className="landing-tour-info">
                                            <i className="bi bi-calendar3"></i>

                                            <span>
                                                {tour.startDate ?? "-"} -{" "}
                                                {tour.endDate ?? "-"}
                                            </span>
                                        </div>

                                    </div>

                                    <button
                                        className="landing-view-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openTour(tour);
                                        }}
                                    >
                                        View Tour Details
                                        <i className="bi bi-arrow-right"></i>
                                    </button>

                                </div>

                            </article>
                        ))}

                    </div>
                )}

            </section>
            <section className="landing-bottom-cta">

                <div className="landing-cta-content">
                    <span>YOUR NEXT ADVENTURE AWAITS</span>

                    <h2>
                        Ready to Explore
                        <br />
                        the World?
                    </h2>

                    <p>
                        Find your dream destination and make your
                        next journey truly unforgettable.
                    </p>
                </div>

                <button
                    className="landing-cta-btn"
                    onClick={scrollToTours}
                >
                    Explore All Tours
                    <i className="bi bi-arrow-right"></i>
                </button>

                <div className="landing-cta-decoration">
                    <i className="bi bi-globe-americas"></i>
                </div>

            </section>

        </main>
    );
}

export default LandingPage;
