
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

import couponService, {
    Coupon,
} from "@/app/apiservice/couponservice";

import CreateCoupons from "./create/page";
import EditCoupon from "./edit/page";

import "./coupons.css";

function Coupons() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [companyId, setCompanyId] = useState<number | null>(null);

    // CREATE / EDIT PAGE VISIBILITY
    const [showCreate, setShowCreate] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

    // PAGINATION
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // TOAST
    const showToast = (
        icon: "success" | "error" | "warning",
        title: string
    ) => {
        Swal.fire({
            toast: true,
            position: "top-end",
            icon,
            title,
            showConfirmButton: false,
            timer: 2500,
            timerProgressBar: true,
        });
    };

    // LOAD COUPONS BY COMPANY
    const loadCoupons = useCallback(async (id: number) => {
        try {
            setLoading(true);

            const response = await couponService.getByCompany({
                companyId: id,
            });

            setCoupons(Array.isArray(response) ? response : []);

        } catch (error: any) {
            console.error("Failed to load coupons:", error);

            showToast(
                "error",
                error?.response?.data?.message ||
                "Failed to load coupons."
            );

        } finally {
            setLoading(false);
        }
    }, []);

    // GET COMPANY ID
    useEffect(() => {
        const storedCompanyId = sessionStorage.getItem("company_id");
        const id = Number(storedCompanyId);

        if (!storedCompanyId || !Number.isInteger(id) || id <= 0) {
            Swal.fire({
                icon: "warning",
                title: "Company Not Selected",
                text: "Please select a company first.",
                confirmButtonColor: "#064e45",
            }).then(() => {
                window.location.href = "/admin/companies";
            });

            setLoading(false);
            return;
        }

        setCompanyId(id);
        loadCoupons(id);

    }, [loadCoupons]);

    // SEARCH
    const filteredCoupons = useMemo(() => {
        const value = search.toLowerCase().trim();

        return coupons.filter((coupon) =>
            coupon.couponCode.toLowerCase().includes(value) ||
            String(coupon.percentage).includes(value) ||
            coupon.status.toLowerCase().includes(value)
        );

    }, [coupons, search]);

    // PAGINATION
    const totalPages = Math.ceil(filteredCoupons.length / pageSize);

    const paginatedCoupons = filteredCoupons.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [search, pageSize]);

    // CREATE SUCCESS
    const handleCreateSuccess = async () => {
        setShowCreate(false);

        if (companyId) {
            await loadCoupons(companyId);
        }

        showToast("success", "Coupon created successfully.");
    };

    // EDIT SUCCESS
    const handleEditSuccess = async () => {
        setEditingCoupon(null);

        if (companyId) {
            await loadCoupons(companyId);
        }

        showToast("success", "Coupon updated successfully.");
    };

    // DELETE COUPON
    const handleDelete = async (coupon: Coupon) => {
        const result = await Swal.fire({
            title: "Delete Coupon?",
            html: `Are you sure you want to delete <strong>${coupon.couponCode}</strong>?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel",
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;

        try {
            await couponService.delete({
                id: coupon.id,
            });

            const updatedCoupons = coupons.filter(
                (item) => item.id !== coupon.id
            );

            setCoupons(updatedCoupons);

            const value = search.toLowerCase().trim();

            const remainingFiltered = updatedCoupons.filter((item) =>
                item.couponCode.toLowerCase().includes(value) ||
                String(item.percentage).includes(value) ||
                item.status.toLowerCase().includes(value)
            );

            const newTotalPages = Math.ceil(
                remainingFiltered.length / pageSize
            );

            if (currentPage > Math.max(newTotalPages, 1)) {
                setCurrentPage(Math.max(newTotalPages, 1));
            }

            showToast("success", "Coupon deleted successfully.");

        } catch (error: any) {
            console.error("Delete coupon error:", error);

            showToast(
                "error",
                error?.response?.data?.message ||
                error?.response?.data?.reason ||
                "Unable to delete coupon."
            );
        }
    };

    // DATE FORMAT
    const formatDate = (date: string | null) => {
        if (!date) return "-";

        const parsedDate = new Date(
            `${date.substring(0, 10)}T00:00:00`
        );

        return Number.isNaN(parsedDate.getTime())
            ? "-"
            : parsedDate.toLocaleDateString();
    };

    // OPEN CREATE PAGE
    if (showCreate) {
        return (
            <CreateCoupons
                onClose={() => setShowCreate(false)}
                onSuccess={handleCreateSuccess}
            />
        );
    }

    // OPEN EDIT PAGE
    if (editingCoupon) {
        return (
            <EditCoupon
                coupon={editingCoupon}
                onClose={() => setEditingCoupon(null)}
                onSuccess={handleEditSuccess}
            />
        );
    }

    return (
        <section className="coupons">

            {/* HEADER */}
            <div className="coupons-header">
                <div>
                    <h2>Coupons</h2>
                    <p>Manage discount coupons for your company.</p>
                </div>

                <button
                    className="coupon-add-btn"
                    onClick={() => setShowCreate(true)}
                    type="button"
                >
                    <i className="bi bi-plus-lg"></i>
                    Add Coupon
                </button>
            </div>

            {/* COUPONS CARD */}
            <div className="coupons-card">

                {/* TOOLBAR */}
                <div className="coupons-toolbar">

                    <div className="coupon-search">
                        <i className="bi bi-search"></i>

                        <input
                            type="text"
                            placeholder="Search coupon code, percentage or status..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="coupon-total">
                        Total Coupons: <strong>{coupons.length}</strong>
                    </div>

                </div>

                {/* TABLE */}
                <div className="table-responsive">
                    <table className="table coupons-table">

                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Coupon Code</th>
                                <th>Discount</th>
                                <th>Expiry Date</th>
                                <th>Usage Limit</th>
                                <th>Used Count</th>
                                <th>Status</th>
                                <th>Created At</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="coupon-empty">
                                        <div className="spinner-border text-success" />
                                        <p>Loading coupons...</p>
                                    </td>
                                </tr>
                            ) : paginatedCoupons.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="coupon-empty">
                                        <i className="bi bi-ticket-perforated"></i>

                                        <p>
                                            {search
                                                ? "No matching coupons found."
                                                : "No coupons available. Add your first coupon."}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedCoupons.map((coupon, index) => (
                                    <tr key={coupon.id}>

                                        <td>
                                            {(currentPage - 1) * pageSize + index + 1}
                                        </td>

                                        <td>
                                            <span className="coupon-code">
                                                {coupon.couponCode}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="coupon-percentage">
                                                {coupon.percentage}%
                                            </span>
                                        </td>

                                        <td>
                                            {formatDate(coupon.expiryDate)}
                                        </td>

                                        <td>
                                            {coupon.usageLimit ?? "Unlimited"}
                                        </td>

                                        <td>
                                            {coupon.usedCount}
                                        </td>

                                        <td>
                                            <span
                                                className={`coupon-status ${
                                                    coupon.status === "ACTIVE"
                                                        ? "active"
                                                        : "inactive"
                                                }`}
                                            >
                                                {coupon.status}
                                            </span>
                                        </td>

                                        <td>
                                            {coupon.createdAt
                                                ? new Date(
                                                    coupon.createdAt
                                                ).toLocaleDateString()
                                                : "-"}
                                        </td>

                                        <td className="text-center">
                                            <div className="coupon-actions">

                                                {/* EDIT */}
                                                <button
                                                    type="button"
                                                    className="coupon-edit-btn"
                                                    title="Edit Coupon"
                                                    onClick={() =>
                                                        setEditingCoupon(coupon)
                                                    }
                                                >
                                                    <i className="bi bi-pencil-square"></i>
                                                </button>

                                                {/* DELETE */}
                                                <button
                                                    type="button"
                                                    className="coupon-delete-btn"
                                                    title="Delete Coupon"
                                                    onClick={() =>
                                                        handleDelete(coupon)
                                                    }
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                {!loading && filteredCoupons.length > 0 && (
                    <div className="coupons-pagination">

                        <div className="coupon-page-size">
                            <span>Rows per page:</span>

                            <select
                                value={pageSize}
                                onChange={(e) =>
                                    setPageSize(Number(e.target.value))
                                }
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>

                        <div className="coupon-page-info">
                            Showing{" "}
                            {(currentPage - 1) * pageSize + 1} to{" "}
                            {Math.min(
                                currentPage * pageSize,
                                filteredCoupons.length
                            )}{" "}
                            of {filteredCoupons.length}
                        </div>

                        <div className="coupon-page-buttons">

                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() =>
                                    setCurrentPage((prev) => prev - 1)
                                }
                            >
                                <i className="bi bi-chevron-left"></i>
                            </button>

                            <span>
                                {currentPage} / {Math.max(totalPages, 1)}
                            </span>

                            <button
                                type="button"
                                disabled={currentPage >= totalPages}
                                onClick={() =>
                                    setCurrentPage((prev) => prev + 1)
                                }
                            >
                                <i className="bi bi-chevron-right"></i>
                            </button>

                        </div>
                    </div>
                )}

            </div>

        </section>
    );
}

export default Coupons;
