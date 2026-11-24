
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { tourPackageService } from "../apiservice/tourservice";
import { TourPackage } from "../types/tour";
import { setSelectedTourId } from "../utils/tourStorage";
import "./tour-list.css";
import Swal from "sweetalert2";

function TourList() {
    const router = useRouter();

    const [tours, setTours] = useState<TourPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(9);
    const [search, setSearch] = useState("");

    // Search only within published tours
    const filteredTours = tours.filter((tour) => {
        const value = search.trim().toLowerCase();

        return (
            tour.tourName?.toLowerCase().includes(value) ||
            tour.tourCode?.toLowerCase().includes(value) ||
            tour.description?.toLowerCase().includes(value)
        );
    });

    const totalPages = Math.ceil(filteredTours.length / pageSize);

    const startIndex = (currentPage - 1) * pageSize;

    const currentTours = filteredTours.slice(
        startIndex,
        startIndex + pageSize
    );

    // Load published tours
    const loadTours = async () => {
        try {
            setLoading(true);
            setError("");

            const companyId = localStorage.getItem("companyId");

            if (!companyId || isNaN(Number(companyId))) {
                throw new Error(
                    "Company ID not found. Please login again."
                );
            }

            const response = await tourPackageService.getByCompanyId(
                Number(companyId)
            );

            // Only show tours with status PUBLISHED
            const publishedTours: TourPackage[] = Array.isArray(response)
                ? response.filter(
                    (tour: TourPackage) =>
                        tour.status?.trim().toUpperCase() === "PUBLISHED"
                )
                : [];

            setTours(publishedTours);
            setCurrentPage(1);

        } catch (e: any) {
            const message =
                e?.response?.data?.message ||
                e?.response?.data?.error ||
                e?.message ||
                "Unable to load tours.";

            setError(message);
            setTours([]);

            Swal.fire({
                icon: "error",
                title: "Unable to Load Tours",
                text: message,
                confirmButtonColor: "#064e45",
            });

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTours();
    }, []);

    // View tour details
    const handleViewTour = (tour: TourPackage) => {
        if (!tour.id) return;

        setSelectedTourId(tour.id);

        router.push(
            `/tour-details/${encodeURIComponent(tour.tourCode ?? "")}`
        );
    };

    // Pagination numbers
    const getPageNumbers = () => {
        const pages: number[] = [];

        let start = Math.max(1, currentPage - 2);
        let end = Math.min(totalPages, currentPage + 2);

        if (currentPage <= 2) {
            end = Math.min(totalPages, 5);
        }

        if (currentPage >= totalPages - 1) {
            start = Math.max(1, totalPages - 4);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return pages;
    };

    // Format date
    const formatDate = (date?: string | null) => {
        if (!date) return "Flexible";

        const parsedDate = new Date(date + "T00:00:00");

        if (isNaN(parsedDate.getTime())) return date;

        return parsedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="tour-list-page">

            {/* Header */}
            <div className="tour-list-header">
                <div>
                    <span className="tour-list-eyebrow">
                        EXPLORE OUR PACKAGES
                    </span>

                    <h1>Discover Your Next Adventure</h1>

                    <p>
                        Explore our handpicked tour packages and find
                        the perfect destination for your next journey.
                    </p>
                </div>
            </div>

            {/* Search and Count */}
            {!loading && !error && (
                <div className="tour-list-toolbar">

                    <div className="tour-list-count">
                        <h3>Available Tours</h3>

                        <span>
                            {filteredTours.length} packages available
                        </span>
                    </div>

                    <div className="tour-list-search">
                        <i className="bi bi-search"></i>

                        <input
                            type="text"
                            placeholder="Search destinations..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch("");
                                    setCurrentPage(1);
                                }}
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        )}
                    </div>

                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="tour-list-loading">
                    <span className="tour-list-spinner"></span>
                    <p>Discovering amazing tours...</p>
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <div className="tour-list-error">
                    <i className="bi bi-exclamation-circle"></i>

                    <h3>Something went wrong</h3>

                    <p>{error}</p>

                    <button onClick={loadTours}>
                        Try Again
                    </button>
                </div>
            )}

            {/* Empty */}
            {!loading && !error && filteredTours.length === 0 && (
                <div className="tour-list-empty">

                    <div className="tour-list-empty-icon">
                        <i className="bi bi-globe-americas"></i>
                    </div>

                    <h3>
                        {search
                            ? "No matching tours found"
                            : "No tours available"}
                    </h3>

                    <p>
                        {search
                            ? "Try searching with another destination or tour name."
                            : "We are preparing exciting travel experiences. Please check back soon."}
                    </p>

                </div>
            )}

            {/* Tour Cards */}
            {!loading && !error && filteredTours.length > 0 && (
                <>

                    <div className="tour-list-grid">

                        {currentTours.map((tour) => {

                            // API cover image
                            const image = tour.coverImageUrl ||
                                (tour as TourPackage & {
                                    coverImage?: string;
                                    thumbnail?: string;
                                    imageUrl?: string;
                                }).coverImage ||
                                (tour as TourPackage & {
                                    thumbnail?: string;
                                }).thumbnail ||
                                (tour as TourPackage & {
                                    imageUrl?: string;
                                }).imageUrl;

                            return (
                                <div
                                    className="tour-card"
                                    key={tour.id}
                                >

                                    {/* Image */}
                                    <div className="tour-card-image">

                                        {image ? (
                                            <img
                                                src={image}
                                                alt={tour.tourName}
                                            />
                                        ) : (
                                            <div className="tour-card-no-image">
                                                <i className="bi bi-image"></i>
                                            </div>
                                        )}

                                        <span className="tour-card-badge">
                                            <i className="bi bi-patch-check-fill"></i>
                                            Published
                                        </span>

                                        {tour.tourCode && (
                                            <span className="tour-card-code">
                                                {tour.tourCode}
                                            </span>
                                        )}

                                    </div>

                                    {/* Content */}
                                    <div className="tour-card-content">

                                        <div className="tour-card-duration">
                                            <i className="bi bi-clock"></i>

                                            {tour.durationDays != null
                                                ? `${tour.durationDays} Days / ${tour.durationNights ?? 0} Nights`
                                                : "Duration not specified"}
                                        </div>

                                        <h3>{tour.tourName}</h3>

                                        <p className="tour-card-description">
                                            {tour.description ||
                                                "Discover beautiful destinations and enjoy an unforgettable travel experience."}
                                        </p>

                                        {/* Tour Details */}
                                        <div className="tour-card-details">

                                            {/* Start Date */}
                                            <div>
                                                <i className="bi bi-calendar-event"></i>

                                                <span>
                                                    <small>Start Date</small>

                                                    <strong>
                                                        {formatDate(tour.startDate)}
                                                    </strong>
                                                </span>
                                            </div>

                                            {/* End Date */}
                                            <div>
                                                <i className="bi bi-calendar-check"></i>

                                                <span>
                                                    <small>End Date</small>

                                                    <strong>
                                                        {formatDate(tour.endDate)}
                                                    </strong>
                                                </span>
                                            </div>

                                            {/* Travellers */}
                                            <div>
                                                <i className="bi bi-people"></i>

                                                <span>
                                                    <small>Travellers</small>

                                                    <strong>
                                                        {tour.minimumTravellers != null ||
                                                        tour.maximumTravellers != null
                                                            ? `${tour.minimumTravellers ?? 1} - ${tour.maximumTravellers ?? "Any"}`
                                                            : "Flexible"}
                                                    </strong>
                                                </span>
                                            </div>

                                        </div>

                                        {/* Explore Button */}
                                        <button
                                            type="button"
                                            className="tour-card-view-btn"
                                            onClick={() => handleViewTour(tour)}
                                        >
                                            <span>Explore Tour</span>

                                            <i className="bi bi-arrow-right"></i>
                                        </button>

                                    </div>

                                </div>
                            );
                        })}

                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="tour-list-pagination">

                            <div className="tour-list-pagination-info">
                                Showing{" "}
                                <strong>
                                    {startIndex + 1}-
                                    {Math.min(
                                        startIndex + pageSize,
                                        filteredTours.length
                                    )}
                                </strong>{" "}
                                of{" "}
                                <strong>{filteredTours.length}</strong> tours
                            </div>

                            <div className="tour-list-pagination-controls">

                                <select
                                    value={pageSize}
                                    onChange={(e) => {
                                        setPageSize(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value={6}>6 per page</option>
                                    <option value={9}>9 per page</option>
                                    <option value={12}>12 per page</option>
                                    <option value={18}>18 per page</option>
                                </select>

                                <button
                                    disabled={currentPage === 1}
                                    onClick={() =>
                                        setCurrentPage((p) => p - 1)
                                    }
                                >
                                    <i className="bi bi-chevron-left"></i>
                                </button>

                                {getPageNumbers().map((page) => (
                                    <button
                                        key={page}
                                        className={
                                            currentPage === page
                                                ? "active"
                                                : ""
                                        }
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() =>
                                        setCurrentPage((p) => p + 1)
                                    }
                                >
                                    <i className="bi bi-chevron-right"></i>
                                </button>

                            </div>

                        </div>
                    )}

                </>
            )}

        </div>
    );
}

export default TourList;
