
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { tourPackageService } from "../apiservice/tourservice";
import { TourDestination, TourPackage } from "../types/tour";
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
            } catch (error) {
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

        router.push(`/tour-details/${encodeURIComponent(tour.tourCode)}`);
    };

    return (
        <div className="landing-page">
            <section className="landing-hero">
                <div className="landing-hero-content">
                    <span className="landing-tag">
                        EXPLORE THE WORLD
                    </span>

                    <h1>
                        Discover Your Next
                        <span> Adventure</span>
                    </h1>

                    <p>
                        Explore amazing destinations, discover unique
                        experiences and find the perfect tour package
                        for your next journey.
                    </p>

                    <button
                        className="landing-explore-btn"
                        onClick={() =>
                            document.getElementById("available-tours")
                                ?.scrollIntoView({ behavior: "smooth" })
                        }
                    >
                        Explore Tours
                        <i className="bi bi-arrow-right"></i>
                    </button>
                </div>
            </section>

            <section className="landing-tours-section" id="available-tours">

                <div className="landing-section-header">
                    <div>
                        <span className="landing-section-label">
                            FIND YOUR JOURNEY
                        </span>

                        <h2>Explore Our Tour Packages</h2>

                        <p>
                            Choose your destination and start planning
                            your next adventure.
                        </p>
                    </div>

                    <span className="landing-tour-count">
                        {tours.length} Tours Available
                    </span>
                </div>

                {loading && (
                    <div className="landing-loading">
                        <span className="landing-spinner"></span>
                        <p>Loading tour packages...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="landing-error">
                        <i className="bi bi-exclamation-circle"></i>
                        {error}
                    </div>
                )}

                {!loading && !error && tours.length === 0 && (
                    <div className="landing-empty">
                        <i className="bi bi-map"></i>
                        <h3>No Tours Available</h3>
                        <p>Tour packages will appear here.</p>
                    </div>
                )}

                {!loading && !error && tours.length > 0 && (
                    <div className="landing-tours-grid">

                        {tours.map((tour) => (
                            <div
                                className="landing-tour-card"
                                key={tour.id}
                                onClick={() => openTour(tour)}
                            >
                                <div className="landing-tour-image">
                                    {tour.coverImageUrl ? (
                                        <img
                                            src={tour.coverImageUrl}
                                            alt={tour.tourName}
                                            className="landing-tour-cover"
                                        />
                                    ) : (
                                        <div className="landing-tour-no-image">
                                            <i className="bi bi-globe-americas"></i>
                                        </div>
                                    )}

                                    <span className="landing-tour-status">
                                        {tour.status ?? "Draft"}
                                    </span>
                                </div>
                                <div className="landing-tour-content">

                                    <span className="landing-tour-code">
                                        {tour.tourCode ?? "-"}
                                    </span>

                                    <h3>{tour.tourName}</h3>

                                    <p className="landing-tour-description">
                                        {tour.description ||
                                            "Discover this amazing tour package and explore new destinations."}
                                    </p>

                                    <div className="landing-tour-info">
                                        <span>
                                            <i className="bi bi-moon-stars"></i>
                                            {tour.durationDays ?? 0} Days /
                                            {" "}
                                            {tour.durationNights ?? 0} Nights
                                        </span>
                                    </div>

                                    <div className="landing-tour-dates">
                                        <i className="bi bi-calendar3"></i>
                                        <span>
                                            {tour.startDate ?? "-"} -{" "}
                                            {tour.endDate ?? "-"}
                                        </span>
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
                            </div>
                        ))}

                    </div>
                )}
            </section>

        </div>
    );
}

export default LandingPage;
