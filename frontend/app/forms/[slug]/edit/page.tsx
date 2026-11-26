
"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
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
    const packageSearchRef = useRef<HTMLDivElement>(null);
    const [form, setForm] = useState<FormResponseDto | null>(null);
    const [companyId, setCompanyId] = useState<number | null>(null);

    const [formTitle, setFormTitle] = useState("");
    const [formDescription, setFormDescription] = useState("");
    const [allowMultipleSubmissions, setAllowMultipleSubmissions] = useState(true);
    const [expiryDate, setExpiryDate] = useState("");

    const [packages, setPackages] = useState<TourPackage[]>([]);
    const [selectedPackages, setSelectedPackages] = useState<TourPackage[]>([]);

    const [packageSearch, setPackageSearch] = useState("");
    const [showPackageDropdown, setShowPackageDropdown] = useState(false);
    const [packageLoading, setPackageLoading] = useState(true);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                packageSearchRef.current &&
                !packageSearchRef.current.contains(event.target as Node)
            ) {
                setShowPackageDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const storedCompanyId = sessionStorage.getItem("company_id");
        const currentCompanyId = storedCompanyId
            ? Number(storedCompanyId)
            : null;

        if (
            !currentCompanyId ||
            !Number.isFinite(currentCompanyId) ||
            !slug ||
            slug === "undefined"
        ) {
            setLoading(false);
            setPackageLoading(false);
            return;
        }

        setCompanyId(currentCompanyId);

        const loadData = async () => {
            try {
                setLoading(true);
                setPackageLoading(true);

                const [formResponse, packageResponse] = await Promise.all([
                    formBuilderService.forms.getBySlug({ slug }),

                    // Get all company packages so existing assignments
                    // are also available for editing.
                    tourPackageService.getByCompanyId(currentCompanyId)
                ]);

                const formData = formResponse;
                const packageData: TourPackage[] = packageResponse || [];

                setForm(formData);
                setPackages(packageData);

                setFormTitle(formData.formTitle || "");
                setFormDescription(formData.formDescription || "");

                setAllowMultipleSubmissions(
                    formData.allowMultipleSubmissions ?? true
                );

                setExpiryDate(
                    formData.expiryDate
                        ? formData.expiryDate.slice(0, 16)
                        : ""
                );

                // Restore previously selected packages
                const existingPackageIds = formData.packageIds || [];

                const existingPackages = packageData.filter(
                    (pkg) =>
                        pkg.id !== undefined &&
                        existingPackageIds.includes(pkg.id)
                );

                setSelectedPackages(existingPackages);

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

    // Filter available packages
    const filteredPackages = useMemo(() => {
        const search = packageSearch.trim().toLowerCase();

        return packages.filter((pkg) => {
            const matchesSearch =
                !search ||
                `${pkg.tourCode || ""} ${pkg.tourName || ""}`
                    .toLowerCase()
                    .includes(search);

            const alreadySelected = selectedPackages.some(
                (selected) => selected.id === pkg.id
            );

            return matchesSearch && !alreadySelected;
        });
    }, [packages, packageSearch, selectedPackages]);

    // Select package
    const handlePackageSelect = (pkg: TourPackage) => {
        if (!pkg.id) return;

        setSelectedPackages((previous) => {
            if (previous.some((item) => item.id === pkg.id)) {
                return previous;
            }

            return [...previous, pkg];
        });

        setPackageSearch("");
        setShowPackageDropdown(false);
    };

    // Remove selected package
    const handleRemovePackage = (packageId: number) => {
        setSelectedPackages((previous) =>
            previous.filter((pkg) => pkg.id !== packageId)
        );
    };

    // Update form
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

        if (selectedPackages.length === 0) {
            Swal.fire({
                icon: "warning",
                title: "Tour Package Required",
                text: "Please select at least one tour package.",
                confirmButtonColor: "#064e45"
            });
            return;
        }

        if (!form || !companyId) {
            Swal.fire({
                icon: "error",
                title: "Form Not Found",
                text: "Unable to find the form you want to update.",
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

        if (!result.isConfirmed) return;

        try {
            setSaving(true);

            await formBuilderService.forms.update({
                id: form.id,
                companyId,
                packageIds: selectedPackages.map((pkg) => pkg.id!),
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
            <div className="edits-data-forms">

                <div className="edit-form-header">
                    <div>
                        <button
                            type="button"
                            className="back-to-forms-btn"
                            onClick={() => router.push("/forms")}
                        >
                            <i className="bi bi-arrow-left"></i>
                            <span>Back to Forms</span>
                        </button>

                        <h1>Edit Form</h1>
                        <p>Update your form information.</p>
                    </div>
                </div>

                <form className="edit-form-card" onSubmit={handleSubmit}>

                    {/* Multiple Package Selection */}
                    <div className="form-field package-search-field"   ref={packageSearchRef}>
                        <label>
                            Select Tour Packages <span>*</span>
                        </label>

                        <div className="package-search-wrapper">

                            <div className="package-search-input-wrapper">
                                <i className="bi bi-search"></i>

                                <input
                                    type="text"
                                    className="tour-name-data"
                                    value={packageSearch}
                                    onChange={(e) => {
                                        setPackageSearch(e.target.value);
                                        setShowPackageDropdown(true);
                                    }}
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
                                        onClick={() => setPackageSearch("")}
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
                                                className="package-option"
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

                                                <i className="bi bi-plus-circle package-check"></i>
                                            </button>
                                        ))

                                    ) : (
                                        <div className="package-dropdown-message">
                                            No available tour packages found.
                                        </div>
                                    )}

                                </div>
                            )}
                        </div>

                        {/* Selected Packages */}
                        {selectedPackages.length > 0 && (
                            <div className="selected-packages-container">

                                <div className="selected-packages-heading">
                                    <span>Selected Packages</span>

                                    <span className="selected-package-count">
                                        {selectedPackages.length} selected
                                    </span>
                                </div>

                                <div className="selected-packages-list">

                                    {selectedPackages.map((pkg) => (
                                        <div
                                            className="selected-package-tag"
                                            key={pkg.id}
                                        >
                                            <div className="selected-package-tag-icon">
                                                <i className="bi bi-airplane"></i>
                                            </div>

                                            <div className="selected-package-tag-details">
                                                <strong>{pkg.tourName}</strong>

                                                <span>
                                                    {pkg.tourCode || "No tour code"}
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                className="remove-selected-package"
                                                onClick={() =>
                                                    handleRemovePackage(pkg.id!)
                                                }
                                                title="Remove package"
                                            >
                                                <i className="bi bi-x-lg"></i>
                                            </button>
                                        </div>
                                    ))}

                                </div>
                            </div>
                        )}
                    </div>

                    {/* Form Title */}
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

                    {/* Description */}
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

                    {/* Expiry Date */}
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

                    {/* Multiple Submissions */}
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

                    {/* Actions */}
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
            </div>
        </section>
    );
}
