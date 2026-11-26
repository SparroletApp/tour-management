
"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import couponService, {
    Coupon,
    CouponUpdateDto,
    CouponStatus,
} from "@/app/apiservice/couponservice";

import "./edit-coupons.css";

interface EditCouponProps {
    coupon: Coupon;
    onClose: () => void;
    onSuccess: () => void;
}

function EditCoupon({
    coupon,
    onClose,
    onSuccess,
}: EditCouponProps) {

    const [couponCode, setCouponCode] = useState(coupon.couponCode);
    const [percentage, setPercentage] = useState(String(coupon.percentage));

    const [expiryDate, setExpiryDate] = useState(
        coupon.expiryDate?.substring(0, 10) || ""
    );

    const [status, setStatus] = useState<CouponStatus>(coupon.status);

    const [usageLimit, setUsageLimit] = useState(
        coupon.usageLimit !== null && coupon.usageLimit !== undefined
            ? String(coupon.usageLimit)
            : ""
    );

    // EDITABLE USED COUNT
    const [usedCount, setUsedCount] = useState(
        String(coupon.usedCount ?? 0)
    );

    const [saving, setSaving] = useState(false);

    // UPDATE FORM WHEN COUPON CHANGES
    useEffect(() => {
        setCouponCode(coupon.couponCode);
        setPercentage(String(coupon.percentage));
        setExpiryDate(coupon.expiryDate?.substring(0, 10) || "");
        setStatus(coupon.status);

        setUsageLimit(
            coupon.usageLimit !== null && coupon.usageLimit !== undefined
                ? String(coupon.usageLimit)
                : ""
        );

        setUsedCount(String(coupon.usedCount ?? 0));

    }, [coupon]);

    // TOAST
    const showToast = (
        icon: "success" | "error" | "warning" | "info",
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

    // UPDATE COUPON
    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        const value = Number(percentage);
        const trimmedCode = couponCode.trim().toUpperCase();

        // GET COMPANY ID
        const storedCompanyId = sessionStorage.getItem("company_id");

        if (!storedCompanyId) {
            showToast("error", "Company ID not found. Please select a company.");
            return;
        }

        const companyId = Number(storedCompanyId);

        if (!Number.isInteger(companyId) || companyId <= 0) {
            showToast("error", "Invalid company ID.");
            return;
        }

        if (!trimmedCode) {
            showToast("warning", "Please enter coupon code.");
            return;
        }

        if (
            !Number.isFinite(value) ||
            value <= 0 ||
            value > 100
        ) {
            showToast("warning", "Percentage must be between 0.01 and 100.");
            return;
        }

        const usageLimitValue =
            usageLimit.trim() === ""
                ? null
                : Number(usageLimit);

        if (
            usageLimitValue !== null &&
            (
                !Number.isInteger(usageLimitValue) ||
                usageLimitValue <= 0
            )
        ) {
            showToast("warning", "Usage limit must be a positive whole number.");
            return;
        }

        const usedCountValue = Number(usedCount);

        if (
            usedCount.trim() === "" ||
            !Number.isInteger(usedCountValue) ||
            usedCountValue < 0
        ) {
            showToast(
                "warning",
                "Used count must be a non-negative whole number."
            );
            return;
        }

        if (expiryDate) {
            const datePattern = /^\d{4}-\d{2}-\d{2}$/;

            if (!datePattern.test(expiryDate)) {
                showToast("warning", "Please enter a valid expiry date.");
                return;
            }

            const [year, month, day] = expiryDate.split("-").map(Number);

            const parsedDate = new Date(year, month - 1, day);

            if (
                parsedDate.getFullYear() !== year ||
                parsedDate.getMonth() !== month - 1 ||
                parsedDate.getDate() !== day
            ) {
                showToast("warning", "Please enter a valid expiry date.");
                return;
            }
        }

        const data: CouponUpdateDto = {
            id: coupon.id,
            couponCode: trimmedCode,
            percentage: value,
            expiryDate: expiryDate || null,
            status,
            usageLimit: usageLimitValue,
            usedCount: usedCountValue,
            companyId,
        };

        try {
            setSaving(true);

            await couponService.update(data);

            showToast("success", "Coupon updated successfully.");

            onSuccess();

        } catch (error: any) {
            console.error("Update coupon error:", error);

            showToast(
                "error",
                error?.response?.data?.message ||
                error?.response?.data?.reason ||
                "Unable to update coupon."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="edit-coupon-page">

            <div className="edit-coupon-page-heading">
                <div>
                    <h2>Edit Coupon</h2>
                    <p>Update the details of your discount coupon.</p>
                </div>

                <button
                    type="button"
                    className="edit-coupon-back"
                    onClick={onClose}
                    disabled={saving}
                >
                    <i className="bi bi-arrow-left"></i>
                    Back to Coupons
                </button>
            </div>

            <div className="edit-coupon-container">

                <div className="edit-coupon-header">
                    <div>
                        <h4>Coupon Information</h4>
                        <p>Update your coupon details below.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>

                    <div className="edit-coupon-body">

                        <div className="row">

                            <div className="col-lg-6 col-md-6 col-12">
                                <div className="edit-coupon-field">
                                    <label>
                                        Coupon Code <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        placeholder="Enter coupon code"
                                        value={couponCode}
                                        maxLength={50}
                                        onChange={(e) =>
                                            setCouponCode(e.target.value.toUpperCase())
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <div className="col-lg-6 col-md-6 col-12">
                                <div className="edit-coupon-field">
                                    <label>
                                        Discount Percentage (%) <span>*</span>
                                    </label>

                                    <div className="edit-coupon-percentage">
                                        <input
                                            type="number"
                                            placeholder="Enter percentage"
                                            min="0.01"
                                            max="100"
                                            step="0.01"
                                            value={percentage}
                                            onChange={(e) =>
                                                setPercentage(e.target.value)
                                            }
                                            required
                                        />

                                        <span>%</span>
                                    </div>

                                    <small>
                                        Minimum 0.01% and maximum 100%.
                                    </small>
                                </div>
                            </div>

                        </div>

                        <div className="row">

                            <div className="col-lg-6 col-md-6 col-12">
                                <div className="edit-coupon-field">
                                    <label>Expiry Date</label>

                                    <input
                                        type="date"
                                        value={expiryDate}
                                        onChange={(e) =>
                                            setExpiryDate(e.target.value)
                                        }
                                    />

                                    <small>
                                        Leave empty if the coupon does not expire.
                                    </small>
                                </div>
                            </div>

                            <div className="col-lg-6 col-md-6 col-12">
                                <div className="edit-coupon-field">
                                    <label>Usage Limit</label>

                                    <input
                                        type="number"
                                        placeholder="e.g. 100"
                                        min="1"
                                        step="1"
                                        value={usageLimit}
                                        onChange={(e) =>
                                            setUsageLimit(e.target.value)
                                        }
                                    />

                                    <small>
                                        Leave empty for unlimited usage.
                                    </small>
                                </div>
                            </div>

                        </div>

                        <div className="row">

                            <div className="col-lg-6 col-md-6 col-12">
                                <div className="edit-coupon-field">
                                    <label>
                                        Status <span>*</span>
                                    </label>

                                    <select
                                        value={status}
                                        onChange={(e) =>
                                            setStatus(e.target.value as CouponStatus)
                                        }
                                        required
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="col-lg-6 col-md-6 col-12">
                                <div className="edit-coupon-field">
                                    <label>Used Count</label>

                                    <input
                                        type="number"
                                        placeholder="Enter used count"
                                        min="0"
                                        step="1"
                                        value={usedCount}
                                        onChange={(e) =>
                                            setUsedCount(e.target.value)
                                        }
                                    />

                                    <small>
                                        Enter the current number of times this coupon has been used.
                                    </small>
                                </div>
                            </div>

                        </div>

                    </div>

                    <div className="edit-coupon-footer">

                        <button
                            type="button"
                            className="edit-coupon-cancel"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="edit-coupon-submit"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <span className="spinner-border spinner-border-sm"></span>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check-lg"></i>
                                    Update Coupon
                                </>
                            )}
                        </button>

                    </div>

                </form>
            </div>

        </section>
    );
}

export default EditCoupon;
