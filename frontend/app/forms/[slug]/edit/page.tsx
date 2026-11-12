
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";

import "./edit-form.css";

import formBuilderService, {
    FormResponseDto
} from "@/app/apiservice/formsservice";

import { tourPackageService } from "@/app/apiservice/tourservice";
import { TourPackage } from "@/app/types/tour";

export default function EditForm() {
    const params = useParams();
    const router = useRouter();

    const slug = String(params.slug || "");

    const [form, setForm] = useState<FormResponseDto | null>(null);

    const [formTitle, setFormTitle] = useState("");
    const [formDescription, setFormDescription] = useState("");
    const [allowMultipleSubmissions, setAllowMultipleSubmissions] = useState(true);
    const [expiryDate, setExpiryDate] = useState("");

    const [packages, setPackages] = useState<TourPackage[]>([]);
    const [selectedPackage, setSelectedPackage] = useState<TourPackage | null>(null);
    const [packageSearch, setPackageSearch] = useState("");
    const [showPackageDropdown, setShowPackageDropdown] = useState(false);
    const [packageLoading, setPackageLoading] = useState(true);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!slug || slug === "undefined") {
            setLoading(false);
            return;
        }

        const loadData = async () => {
            try {
                setLoading(true);
                setPackageLoading(true);

                const [formResponse, packageResponse] = await Promise.all([
                    formBuilderService.forms.getBySlug({ slug }),
                    tourPackageService.getAll()
                ]);

                const formData = formResponse;
                const packageData = packageResponse || [];

                setForm(formData);
                setPackages(packageData);

                setFormTitle(formData.formTitle);
                setFormDescription(formData.formDescription || "");
                setAllowMultipleSubmissions(formData.allowMultipleSubmissions);

                setExpiryDate(
                    formData.expiryDate
                        ? formData.expiryDate.slice(0, 16)
                        : ""
                );

                const existingPackage = packageData.find(
                    (pkg: TourPackage) => pkg.id === formData.packageId
                );

                if (existingPackage) {
                    setSelectedPackage(existingPackage);

                    setPackageSearch(
                        `${existingPackage.tourCode
                            ? existingPackage.tourCode + " - "
                            : ""
                        }${existingPackage.tourName}`
                    );
                }

            } catch (error) {
                console.error("Error loading form:", error);

                await Swal.fire({
                    icon: "error",
                    title: "Loading Failed",
                    text: "Unable to load form. Please try again.",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#064e45"
                });

                setForm(null);
            } finally {
                setLoading(false);
                setPackageLoading(false);
            }
        };

        loadData();
    }, [slug]);

    const filteredPackages = useMemo(() => {
        const search = packageSearch.trim().toLowerCase();

        if (!search) {
            return packages;
        }

        return packages.filter((pkg) =>
            `${pkg.tourCode || ""} ${pkg.tourName || ""}`
                .toLowerCase()
                .includes(search)
        );
    }, [packages, packageSearch]);

    const handlePackageSelect = (pkg: TourPackage) => {
        setSelectedPackage(pkg);

        setPackageSearch(
            `${pkg.tourCode ? pkg.tourCode + " - " : ""}${pkg.tourName}`
        );

        setShowPackageDropdown(false);
    };

    const handlePackageSearch = (value: string) => {
        setPackageSearch(value);
        setSelectedPackage(null);
        setShowPackageDropdown(true);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!formTitle.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Form Title Required",
                text: "Please enter a form title.",
                confirmButtonColor: "#064e45"
            });
            return;
        }

        if (!form) {
            Swal.fire({
                icon: "error",
                title: "Form Not Found",
                text: "Unable to find the form you want to update.",
                confirmButtonColor: "#064e45"
            });
            return;
        }

        if (!selectedPackage?.id) {
            Swal.fire({
                icon: "warning",
                title: "Tour Package Required",
                text: "Please select a tour package.",
                confirmButtonColor: "#064e45"
            });
            return;
        }

        const result = await Swal.fire({
            title: "Update Form?",
            text: "Are you sure you want to save these changes?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, Update",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#064e45",
            cancelButtonColor: "#6c757d",
            reverseButtons: true
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            setSaving(true);

            await formBuilderService.forms.update({
                id: form.id,
                packageId: selectedPackage.id,
                formTitle: formTitle.trim(),
                formDescription: formDescription.trim(),
                allowMultipleSubmissions,
                expiryDate: expiryDate || null
            });

            await Swal.fire({
                icon: "success",
                title: "Updated Successfully!",
                text: "Your form has been updated successfully.",
                confirmButtonText: "Continue",
                confirmButtonColor: "#064e45"
            });

            router.push("/forms");

        } catch (error) {
            console.error("Update form error:", error);

            Swal.fire({
                icon: "error",
                title: "Update Failed",
                text: "Unable to update form. Please try again.",
                confirmButtonColor: "#064e45"
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <section className="edit-form">
                <div className="edit-form-loading">
                    <i className="bi bi-arrow-repeat"></i>
                    Loading form...
                </div>
            </section>
        );
    }

    if (!form) {
        return (
            <section className="edit-form">
                <div className="edit-form-loading">
                    Form not found.
                </div>
            </section>
        );
    }

    return (
        <section className="edit-form">
            <div className="edit-form-header">
                <div>
                    <h1>Edit Form</h1>
                    <p>Update your form information.</p>
                </div>
            </div>

            <form className="edit-form-card" onSubmit={handleSubmit}>
                <div className="form-field package-search-field">
                    <label>
                        Select Tour Package <span>*</span>
                    </label>

                    <div className="package-search-wrapper">
                        <div className="package-search-input-wrapper">
                            <i className="bi bi-search"></i>

                            <input
                                type="text"
                                className="tour-name-data"
                                value={packageSearch}
                                onChange={(e) =>
                                    handlePackageSearch(e.target.value)
                                }
                                onFocus={() =>
                                    setShowPackageDropdown(true)
                                }
                                placeholder="Search by tour name or code..."
                                autoComplete="off"
                            />

                            {packageSearch && (
                                <button
                                    type="button"
                                    className="package-clear-btn"
                                    onClick={() => {
                                        setPackageSearch("");
                                        setSelectedPackage(null);
                                        setShowPackageDropdown(true);
                                    }}
                                >
                                    <i className="bi bi-x-circle"></i>
                                </button>
                            )}
                        </div>

                        {showPackageDropdown && (
                            <div className="package-dropdown">
                                {packageLoading ? (
                                    <div className="package-dropdown-message">
                                        Loading tour packages...
                                    </div>
                                ) : filteredPackages.length > 0 ? (
                                    filteredPackages.map((pkg) => (
                                        <button
                                            type="button"
                                            key={pkg.id}
                                            className={`package-option ${
                                                selectedPackage?.id === pkg.id
                                                    ? "selected"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                handlePackageSelect(pkg)
                                            }
                                        >
                                            <div className="package-option-icon">
                                                <i className="bi bi-airplane"></i>
                                            </div>

                                            <div className="package-option-details">
                                                <strong>{pkg.tourName}</strong>
                                                <span>
                                                    {pkg.tourCode || "No tour code"}
                                                </span>
                                            </div>

                                            {selectedPackage?.id === pkg.id && (
                                                <i className="bi bi-check-circle-fill package-check"></i>
                                            )}
                                        </button>
                                    ))
                                ) : (
                                    <div className="package-dropdown-message">
                                        No tour packages found.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {selectedPackage && (
                        <div className="selected-package-info">
                            <i className="bi bi-check-circle-fill"></i>
                            Selected: {selectedPackage.tourName}
                            {selectedPackage.tourCode &&
                                ` (${selectedPackage.tourCode})`}
                        </div>
                    )}
                </div>

                <div className="form-field">
                    <label>Form Title *</label>
                    <input
                        type="text"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="Enter form title"
                        required
                    />
                </div>

                <div className="form-field">
                    <label>Description</label>
                    <textarea
                        rows={4}
                        value={formDescription}
                        onChange={(e) =>
                            setFormDescription(e.target.value)
                        }
                        placeholder="Enter form description"
                    />
                </div>

                <div className="form-field">
                    <label>Expiry Date</label>
                    <input
                        type="datetime-local"
                        value={expiryDate}
                        onChange={(e) =>
                            setExpiryDate(e.target.value)
                        }
                    />
                </div>

                <label className="form-checkbox">
                    <input
                        type="checkbox"
                        checked={allowMultipleSubmissions}
                        onChange={(e) =>
                            setAllowMultipleSubmissions(e.target.checked)
                        }
                    />
                    Allow multiple submissions
                </label>

                <div className="edit-form-actions">
                    <button
                        type="button"
                        className="form-secondary-btn"
                        onClick={() => router.back()}
                        disabled={saving}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={saving || packageLoading}
                        className="form-primary-btn"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </section>
    );
}
