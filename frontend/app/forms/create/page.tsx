
"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import "./create-forms.css";

import formBuilderService from "@/app/apiservice/formsservice";
import { tourPackageService } from "@/app/apiservice/tourservice";
import { TourPackage } from "@/app/types/tour";

export default function CreateForm() {
    const router = useRouter();

    const [formTitle, setFormTitle] = useState("");
    const [formDescription, setFormDescription] = useState("");
    const [allowMultipleSubmissions, setAllowMultipleSubmissions] = useState(true);
    const [expiryDate, setExpiryDate] = useState("");
    const packageSearchRef = useRef<HTMLDivElement>(null);
    const [companyId, setCompanyId] = useState<number | null>(null);

    const [packages, setPackages] = useState<TourPackage[]>([]);
    const [selectedPackages, setSelectedPackages] = useState<TourPackage[]>([]);

    const [packageSearch, setPackageSearch] = useState("");
    const [showPackageDropdown, setShowPackageDropdown] = useState(false);

    const [loading, setLoading] = useState(false);
    const [packageLoading, setPackageLoading] = useState(true);

    // Close package dropdown when clicking outside
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

        if (!storedCompanyId || isNaN(Number(storedCompanyId))) {
            alert("Company ID not found. Please login again.");
            router.push("/");
            return;
        }

        setCompanyId(Number(storedCompanyId));
    }, [router]);

    // Fetch unassigned packages
    useEffect(() => {
        if (!companyId) return;

        const fetchPackages = async () => {
            try {
                setPackageLoading(true);

                const response =
                    await tourPackageService.getUnassignedByCompanyId(companyId);

                setPackages(response || []);
            } catch (error) {
                console.error("Error loading tour packages:", error);
                alert("Unable to load available tour packages.");
            } finally {
                setPackageLoading(false);
            }
        };

        fetchPackages();
    }, [companyId]);

    // Filter packages
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

    // Remove package
    const handleRemovePackage = (packageId: number) => {
        setSelectedPackages((previous) =>
            previous.filter((pkg) => pkg.id !== packageId)
        );
    };

    // Submit form
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!companyId) {
            alert("Company ID not found. Please login again.");
            return;
        }

        if (selectedPackages.length === 0) {
            alert("Please select at least one tour package.");
            return;
        }

        if (!formTitle.trim()) {
            alert("Please enter a form title.");
            return;
        }

        try {
            setLoading(true);

            const response = await formBuilderService.forms.create({
                companyId,
                packageIds: selectedPackages.map((pkg) => pkg.id!),
                formTitle: formTitle.trim(),
                formDescription: formDescription.trim(),
                allowMultipleSubmissions,
                expiryDate: expiryDate || null,
            });

            if (!response.slug) {
                alert("Form created, but slug was not returned by the server.");
                return;
            }

            router.push(
                `/forms/${encodeURIComponent(response.slug)}/builder`
            );
        } catch (error) {
            console.error("Create form error:", error);
            alert("Unable to create form.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="whole-contain-form">
            <section className="create-form">

                <Link href="/forms" className="forms-back-link">
                    <i className="bi bi-arrow-left"></i>
                    <span>Back to Forms</span>
                </Link>

                <div className="create-form-header">
                    <div>
                        <h1>Create Form</h1>
                        <p>Enter the basic details of your form.</p>
                    </div>
                </div>

                <form className="create-form-card" onSubmit={handleSubmit}>

                    <div className="form-field package-search-field" ref={packageSearchRef}>
                        <label>
                            Select Tour Packages <span>*</span>
                        </label>

                        <div className="package-search-wrapper">

                            <div className="package-search-input-wrapper">
                                <i className="bi bi-search"></i>

                                <input
                                    type="text"
                                    value={packageSearch}
                                    className="search-name-data"
                                    onChange={(e) => {
                                        setPackageSearch(e.target.value);
                                        setShowPackageDropdown(true);
                                    }}
                                    onFocus={() => setShowPackageDropdown(true)}
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
                                            <i className="bi bi-arrow-repeat"></i>
                                            Loading tour packages...
                                        </div>
                                    ) : filteredPackages.length > 0 ? (

                                        filteredPackages.map((pkg) => (
                                            <button
                                                type="button"
                                                key={pkg.id}
                                                className="package-option"
                                                onClick={() => handlePackageSelect(pkg)}
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
                                            <i className="bi bi-search"></i>
                                            No available tour packages found.
                                        </div>
                                    )}

                                </div>
                            )}
                        </div>

                        {/* Selected Package Tags */}
                        {selectedPackages.length > 0 && (
                            <div className="selected-packages-container">

                                <div className="selected-packages-heading">
                                    <span>
                                        Selected Packages
                                    </span>

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
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                            placeholder="Enter form description"
                            rows={4}
                        />
                    </div>

                    {/* Expiry Date */}
                    <div className="form-field">
                        <label>Expiry Date</label>

                        <input
                            type="datetime-local"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
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
                    <div className="create-form-actions">

                        <button
                            type="button"
                            className="form-secondary-btn"
                            onClick={() => router.back()}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={
                                loading ||
                                packageLoading ||
                                selectedPackages.length === 0
                            }
                            className="form-primary-btn"
                        >
                            {loading ? "Creating..." : "Create and Continue"}
                        </button>

                    </div>

                </form>
            </section>
        </div>
    );
}
