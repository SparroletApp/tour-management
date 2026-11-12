
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

    const loadTours = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await tourPackageService.getAll();
            setTours(data);
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

            setTours((prev) => prev.filter((tour) => tour.id !== id));

            if (getSelectedTourId() === String(id)) {
                clearSelectedTourId();
            }
        } catch (e) {
            alert("Failed to delete tour");
        }
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
                                {tours.map((tour) => (
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
                                                    openTour(
                                                        tour.id as number,
                                                        "view"
                                                    )
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
                                                    openTour(
                                                        tour.id as number,
                                                        "edit"
                                                    )
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
                                                    handleDelete(
                                                        tour.id as number
                                                    )
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
                </div>
            )}
        </div>
    );
}

export default Tours;
