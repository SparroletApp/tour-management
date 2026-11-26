"use client";

import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";

import termsService, { Terms as TermsType } from "@/app/apiservice/termsservice";

import "./terms.css";
import CreateTerms from "./create/page";
import EditTerms from "./edit/page";

const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
});

function Terms() {
    const [terms, setTerms] = useState<TermsType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchTerms = useCallback(async (showLoader = false) => {
        if (showLoader) setLoading(true);

        try {
            const companyId = sessionStorage.getItem("company_id");

            if (!companyId || !Number.isFinite(Number(companyId))) {
                setError("Company ID not found. Please login again.");
                setTerms([]);
                return;
            }

            const response = await termsService.getByCompanyId(
                Number(companyId)
            );

            setTerms(response);
            setError("");
        } catch (error) {
            console.error("Error fetching terms:", error);
            setError("Unable to load terms and conditions.");
        } finally {
            if (showLoader) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTerms(true);
    }, [fetchTerms]);

    const handleDelete = async (item: TermsType) => {
        const result = await Swal.fire({
            title: "Delete Terms?",
            text: `Are you sure you want to delete "${item.name}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#dc3545",
            cancelButtonColor: "#64748b",
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;

        try {
            await termsService.delete(item.id);

            setTerms((prev) =>
                prev.filter((term) => term.id !== item.id)
            );

            Toast.fire({
                icon: "success",
                title: "Terms deleted successfully!",
            });

        } catch (error: any) {
            console.error("Error deleting terms:", error);

            Toast.fire({
                icon: "error",
                title:
                    error?.response?.data?.message ||
                    "Failed to delete terms and conditions.",
            });
        }
    };

    const formatDate = (date: string | null) => {
        if (!date) return "—";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) return date;

        return parsedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <section className="terms-page">

            {/* Create Terms */}
            <CreateTerms onCreated={() => fetchTerms()} />

            {/* Terms Table */}
            <div className="terms-table-card">

                <div className="terms-table-heading">
                    <div>
                        <h3>All Terms & Conditions</h3>
                        <p>View and manage your company terms.</p>
                    </div>

                    <span className="terms-count">
                        {terms.length}{" "}
                        {terms.length === 1 ? "Record" : "Records"}
                    </span>
                </div>

                {loading ? (
                    <div className="terms-loading">
                        <span className="terms-loading-spinner"></span>
                        <p>Loading terms and conditions...</p>
                    </div>
                ) : error ? (
                    <div className="terms-empty">
                        <i className="bi bi-exclamation-circle"></i>
                        <p>{error}</p>

                        <button
                            type="button"
                            onClick={() => fetchTerms(true)}
                        >
                            Try Again
                        </button>
                    </div>
                ) : terms.length === 0 ? (
                    <div className="terms-empty">
                        <i className="bi bi-file-earmark-text"></i>
                        <h4>No Terms & Conditions Found</h4>
                        <p>Click Add Terms to create your first record.</p>
                    </div>
                ) : (
                    <div className="terms-table-responsive">
                        <table className="terms-table">
                            <thead>
                                <tr>
                                    <th className="terms-number-col">#</th>
                                    <th>Terms Name</th>
                                    <th>Description</th>
                                    <th>Created Date</th>
                                    <th>Updated Date</th>
                                    <th className="terms-actions-col">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {terms.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="terms-number">
                                            {String(index + 1).padStart(2, "0")}
                                        </td>

                                        <td>
                                            <div className="terms-name-cell">
                                                <span className="terms-name-icon">
                                                    <i className="bi bi-file-text"></i>
                                                </span>

                                                <strong>{item.name}</strong>
                                            </div>
                                        </td>

                                        <td>
                                            <div
                                                className="terms-description"
                                                dangerouslySetInnerHTML={{
                                                    __html: item.description || "—",
                                                }}
                                            />
                                        </td>

                                        <td className="terms-date">
                                            {formatDate(item.createdAt)}
                                        </td>

                                        <td className="terms-date">
                                            {formatDate(item.updatedAt)}
                                        </td>

                                        <td>
                                            <div className="terms-actions">

                                                {/* Edit */}
                                                <EditTerms
                                                    term={item}
                                                    onUpdated={() => fetchTerms()}
                                                />

                                                {/* Delete */}
                                                <button
                                                    type="button"
                                                    className="terms-delete-btn"
                                                    title="Delete Terms"
                                                    aria-label="Delete terms"
                                                    onClick={() => handleDelete(item)}
                                                >
                                                    <i className="bi bi-trash3"></i>
                                                </button>

                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="terms-table-footer">
                    Showing {terms.length}{" "}
                    {terms.length === 1 ? "entry" : "entries"}
                </div>

            </div>
        </section>
    );
}

export default Terms;