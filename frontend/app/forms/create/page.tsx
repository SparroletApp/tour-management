
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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

    const [packages, setPackages] = useState<TourPackage[]>([]);
    const [selectedPackage, setSelectedPackage] = useState<TourPackage | null>(null);
    const [packageSearch, setPackageSearch] = useState("");
    const [showPackageDropdown, setShowPackageDropdown] = useState(false);

    const [loading, setLoading] = useState(false);
    const [packageLoading, setPackageLoading] = useState(true);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                setPackageLoading(true);

                const response = await tourPackageService.getAll();

                setPackages(response || []);
            } catch (error) {
                console.error("Error loading tour packages:", error);
                alert("Unable to load tour packages.");
            } finally {
                setPackageLoading(false);
            }
        };

        fetchPackages();
    }, []);

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

        if (!selectedPackage || !selectedPackage.id) {
            alert("Please select a tour package.");
            return;
        }

        if (!formTitle.trim()) {
            alert("Please enter a form title.");
            return;
        }

        try {
            setLoading(true);

            const response = await formBuilderService.forms.create({
                packageId: selectedPackage.id,
                formTitle: formTitle.trim(),
                formDescription: formDescription.trim(),
                allowMultipleSubmissions,
                expiryDate: expiryDate || null,
            });

            const createdForm = response;

            if (!createdForm.slug) {
                alert("Form created, but slug was not returned by the server.");
                return;
            }

            router.push(
                `/forms/${encodeURIComponent(createdForm.slug)}/builder`
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
                    <div className="form-field package-search-field">
                        <label>
                            Select Tour Package <span>*</span>
                        </label>

                        <div className="package-search-wrapper">

                            <div className="package-search-input-wrapper">
                                <i className="bi bi-search"></i>

                                <input
                                    type="text"
                                    value={packageSearch}
                                    className="search-name-data"
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
                                            <i className="bi bi-arrow-repeat"></i>
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
                                                    <strong>
                                                        {pkg.tourName}
                                                    </strong>

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
                                            <i className="bi bi-search"></i>
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
                            value={formDescription}
                            onChange={(e) =>
                                setFormDescription(e.target.value)
                            }
                            placeholder="Enter form description"
                            rows={4}
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

                    <div className="create-form-actions">

                        <button
                            type="button"
                            className="form-secondary-btn"
                            onClick={() => router.push("/forms")}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading || packageLoading}
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
