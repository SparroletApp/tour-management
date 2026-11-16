
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { tourPackageService } from "../apiservice/tourservice";
import { TourPackage } from "../types/tour";
import "./tours.css";

import {
    clearSelectedTourId,
    getSelectedTourId,
    setSelectedTourId,
} from "../utils/tourStorage";

import Breadcrumb from "../component/BreadCrumb";

function Tours() {
    const router = useRouter();

    const [tours, setTours] = useState<TourPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const totalPages = Math.ceil(tours.length / pageSize);

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, tours.length);

    const currentTours = tours.slice(startIndex, endIndex);

    const loadTours = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await tourPackageService.getAll();
            setTours(data);
            setCurrentPage(1);
        } catch (e) {
            setError("Failed to load tours");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTours();
    }, []);

    const openTour = (id: number, page: "view" | "edit") => {
        setSelectedTourId(id);
        router.push(`/tours/${page}`);
    };

    const handleDelete = async (id: number) => {
        if (
            !confirm(
                "Delete this tour and everything inside it (days, flights, hotels...)?"
            )
        ) {
            return;
        }

        try {
            await tourPackageService.delete(id);

            const updatedTours = tours.filter(
                (tour) => tour.id !== id
            );

            setTours(updatedTours);

            if (getSelectedTourId() === String(id)) {
                clearSelectedTourId();
            }
            const updatedTotalPages = Math.ceil(
                updatedTours.length / pageSize
            );

            if (currentPage > updatedTotalPages && updatedTotalPages > 0) {
                setCurrentPage(updatedTotalPages);
            }
        } catch (e) {
            alert("Failed to delete tour");
        }
    };

    const handlePageSizeChange = (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(1);
    };

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

    return (
        <div className="tours-page">
            <Breadcrumb
                items={[
                    { label: "Home", href: "/" },
                    { label: "Tours" },
                ]}
            />

            <div className="tours-header">
                <div className="tours-header-content">
                    <h2 className="tours-title">Tours</h2>
                    <p className="tours-subtitle">
                        Manage and organize all your tour packages.
                    </p>
                </div>

                <button
                    type="button"
                    className="create-tour-btn"
                    onClick={() => router.push("/tours/create")}
                >
                    <i className="bi bi-plus-lg"></i>
                    <span>Create Tour</span>
                </button>
            </div>

            {loading && (
                <div className="tours-loading">
                    <span className="tours-spinner"></span>
                    <p>Loading tours...</p>
                </div>
            )}

            {!loading && error && (
                <div className="tours-error">
                    <i className="bi bi-exclamation-circle"></i>
                    <span>{error}</span>

                    <button
                        type="button"
                        className="tours-retry-btn"
                        onClick={loadTours}
                    >
                        Retry
                    </button>
                </div>
            )}

            {!loading && !error && tours.length === 0 && (
                <div className="tours-empty">
                    <div className="tours-empty-icon">
                        <i className="bi bi-map"></i>
                    </div>

                    <h3>No tours found</h3>

                    <p>
                        You haven't created any tour packages yet.
                    </p>

                    <button
                        type="button"
                        className="create-tour-btn"
                        onClick={() => router.push("/tours/create")}
                    >
                        <i className="bi bi-plus-lg"></i>
                        <span>Create Your First Tour</span>
                    </button>
                </div>
            )}

            {!loading && !error && tours.length > 0 && (
                <div className="tours-table-container">
                    <div className="tours-table-top">
                        <div>
                            <h3 className="tours-table-heading">
                                All Tour Packages
                            </h3>
                            <p className="tours-table-count">
                                {tours.length}{" "}
                                {tours.length === 1 ? "tour" : "tours"} available
                            </p>
                        </div>
                    </div>

                    <div className="tours-table-responsive">
                        <table className="tours-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Tour Code</th>
                                    <th>Tour Name</th>
                                    <th>Duration</th>
                                    <th>Travel Dates</th>
                                    <th>Status</th>
                                    <th className="actions-heading">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {currentTours.map((tour) => (
                                    <tr key={tour.id}>
                                        <td className="tour-id">
                                            #{tour.id}
                                        </td>

                                        <td className="tour-code">
                                            {tour.tourCode ?? "-"}
                                        </td>

                                        <td className="tour-name">
                                            {tour.tourName}
                                        </td>

                                        <td className="tour-duration">
                                            {tour.durationDays != null
                                                ? `${tour.durationDays}D / ${tour.durationNights ?? 0}N`
                                                : "-"}
                                        </td>

                                        <td className="tour-dates">
                                            <i className="bi bi-calendar3"></i>
                                            <span>
                                                {tour.startDate ?? "-"} →{" "}
                                                {tour.endDate ?? "-"}
                                            </span>
                                        </td>

                                        <td className="tour-status-cell">
                                            <span
                                                className={`tour-status ${
                                                    tour.status?.toLowerCase() === "published"
                                                        ? "published"
                                                        : tour.status?.toLowerCase() === "archived"
                                                        ? "archived"
                                                        : "draft"
                                                }`}
                                            >
                                                {tour.status ?? "Draft"}
                                            </span>
                                        </td>

                                        <td className="tour-actions">
                                            <button
                                                type="button"
                                                className="tour-action-btn tour-view-btn"
                                                onClick={() =>
                                                    openTour(tour.id as number, "view")
                                                }
                                                title="View tour"
                                            >
                                                <i className="bi bi-eye"></i>
                                                <span>View</span>
                                            </button>

                                            <button
                                                type="button"
                                                className="tour-action-btn tour-edit-btn"
                                                onClick={() =>
                                                    openTour(tour.id as number, "edit")
                                                }
                                                title="Edit tour"
                                            >
                                                <i className="bi bi-pencil-square"></i>
                                                <span>Edit</span>
                                            </button>

                                            <button
                                                type="button"
                                                className="tour-action-btn tour-delete-btn"
                                                onClick={() =>
                                                    handleDelete(tour.id as number)
                                                }
                                                title="Delete tour"
                                            >
                                                <i className="bi bi-trash"></i>
                                                <span>Delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="tours-pagination">

                        <div className="pagination-info">
                            <span>Showing</span>
                            <strong>{startIndex + 1}-{endIndex}</strong>
                            <span>of</span>
                            <strong>{tours.length}</strong>
                            <span>tours</span>
                        </div>

                        <div className="pagination-controls">

                            <div className="pagination-size">
                                <label htmlFor="tourPageSize">
                                    Rows per page
                                </label>

                                <select
                                    id="tourPageSize"
                                    value={pageSize}
                                    onChange={handlePageSizeChange}
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>

                            <div className="pagination-buttons">
                                <button
                                    type="button"
                                    className="pagination-arrow"
                                    disabled={currentPage === 1}
                                    onClick={() =>
                                        setCurrentPage((prev) => prev - 1)
                                    }
                                    title="Previous page"
                                >
                                    <i className="bi bi-chevron-left"></i>
                                </button>

                                {getPageNumbers().map((page) => (
                                    <button
                                        type="button"
                                        key={page}
                                        className={`pagination-number ${
                                            currentPage === page ? "active" : ""
                                        }`}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    type="button"
                                    className="pagination-arrow"
                                    disabled={currentPage === totalPages}
                                    onClick={() =>
                                        setCurrentPage((prev) => prev + 1)
                                    }
                                    title="Next page"
                                >
                                    <i className="bi bi-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Tours;
