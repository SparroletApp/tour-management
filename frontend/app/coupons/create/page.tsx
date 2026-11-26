
"use client";

import { useState } from "react";
import Swal from "sweetalert2";

import couponService, {
    CouponCreateDto,
    CouponStatus,
} from "@/app/apiservice/couponservice";

import "./create-coupons.css";

interface CreateCouponsProps {
    onClose: () => void;
    onSuccess: () => void;
}

function CreateCoupons({ onClose, onSuccess }: CreateCouponsProps) {
    const [couponCode, setCouponCode] = useState("");
    const [percentage, setPercentage] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [status, setStatus] = useState<CouponStatus>("ACTIVE");
    const [usageLimit, setUsageLimit] = useState("");
    const [saving, setSaving] = useState(false);

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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const storedCompanyId = sessionStorage.getItem("company_id");
        const companyId = Number(storedCompanyId);

        if (!storedCompanyId || !Number.isInteger(companyId) || companyId <= 0) {
            showToast("warning", "Please select a company first.");
            return;
        }

        const trimmedCode = couponCode.trim().toUpperCase();
        const percentageValue = Number(percentage);

        const usageLimitValue =
            usageLimit.trim() === "" ? null : Number(usageLimit);

        // VALIDATE COUPON CODE
        if (!trimmedCode) {
            showToast("warning", "Please enter coupon code.");
            return;
        }

        // VALIDATE PERCENTAGE
        if (
            !Number.isFinite(percentageValue) ||
            percentageValue <= 0 ||
            percentageValue > 100
        ) {
            showToast("warning", "Percentage must be between 0.01 and 100.");
            return;
        }

        // VALIDATE USAGE LIMIT
        if (
            usageLimitValue !== null &&
            (!Number.isInteger(usageLimitValue) || usageLimitValue <= 0)
        ) {
            showToast("warning", "Usage limit must be a positive whole number.");
            return;
        }

        // VALIDATE EXPIRY DATE (WITHOUT UTC CONVERSION)
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

        try {
            setSaving(true);

            const data: CouponCreateDto = {
                couponCode: trimmedCode,
                percentage: percentageValue,
                expiryDate: expiryDate || null,
                status,
                usageLimit: usageLimitValue,
                companyId,
            };

            await couponService.create(data);

            showToast("success", "Coupon created successfully.");

            onSuccess();

        } catch (error: any) {
            console.error("Create coupon error:", error);

            showToast(
                "error",
                error?.response?.data?.message ||
                error?.response?.data?.reason ||
                "Unable to create coupon."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="create-coupon-page">

            {/* PAGE HEADER */}
            <div className="create-coupon-page-heading">
                <div>
                    <h2>Create Coupon</h2>
                    <p>Add a new discount coupon for your company.</p>
                </div>

                <button
                    type="button"
                    className="create-coupon-back"
                    onClick={onClose}
                    disabled={saving}
                >
                    <i className="bi bi-arrow-left"></i>
                    Back to Coupons
                </button>
            </div>

            {/* FORM CARD */}
            <div className="create-coupon-container">

                <div className="create-coupon-header">
                    <div>
                        <h4>Coupon Information</h4>
                        <p>Enter the details to create a new coupon.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>

                    <div className="create-coupon-body">

                        <div className="row">

                            {/* COUPON CODE */}
                            <div className="col-lg-6 col-md-6 col-12">
                                <div className="create-coupon-field">
                                    <label>
                                        Coupon Code <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        placeholder="e.g. SUMMER20"
                                        value={couponCode}
                                        maxLength={50}
                                        onChange={(e) =>
                                            setCouponCode(e.target.value.toUpperCase())
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            {/* PERCENTAGE */}
                            <div className="col-lg-6 col-md-6 col-12">
                                <div className="create-coupon-field">
                                    <label>
                                        Discount Percentage (%) <span>*</span>
                                    </label>

                                    <div className="create-coupon-percentage">
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

                            {/* EXPIRY DATE */}
                            <div className="col-lg-6 col-md-6 col-12">
                                <div className="create-coupon-field">
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

                            {/* USAGE LIMIT */}
                            <div className="col-lg-6 col-md-6 col-12">
                                <div className="create-coupon-field">
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

                            {/* STATUS */}
                            <div className="col-lg-6 col-md-6 col-12">
                                <div className="create-coupon-field">
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

                        </div>

                    </div>

                    {/* FOOTER */}
                    <div className="create-coupon-footer">

                        <button
                            type="button"
                            className="create-coupon-cancel"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="create-coupon-submit"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <span className="spinner-border spinner-border-sm"></span>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-plus-lg"></i>
                                    Create Coupon
                                </>
                            )}
                        </button>

                    </div>

                </form>
            </div>

        </section>
    );
}

export default CreateCoupons;
