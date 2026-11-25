
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

import companyService, {
    CompanyCreateDto,
    CompanyResponseDto,
} from "../../apiservice/companyservice";

import "./companies.css";

function Companies() {
    const router = useRouter();

    const [companies, setCompanies] = useState<CompanyResponseDto[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState(false);

    const [formData, setFormData] = useState<CompanyCreateDto>({
         companyName: "",
    });

    const getErrorMessage = (error: any): string => {
        const data = error?.response?.data;

        if (typeof data === "string") return data;
        if (data?.message) return data.message;
        if (data?.error) return data.error;

        return error?.message || "Something went wrong. Please try again.";
    };

    const fetchCompanies = useCallback(async () => {
        try {
            setLoading(true);

            const response = await companyService.getAll();

            setCompanies(Array.isArray(response) ? response : []);
        } catch (error: any) {
            console.error("Fetch companies error:", error);

            Swal.fire({
                icon: "error",
                title: "Failed to Load Companies",
                text: getErrorMessage(error),
                confirmButtonColor: "#064e45",
            });

            setCompanies([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    const resetForm = () => {
        setFormData({
            companyName: "",
        });

        setEditingId(null);
        setViewMode(false);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (company: CompanyResponseDto) => {
        setFormData({
             companyName: company. companyName,
        });

        setEditingId(company.id);
        setViewMode(false);
        setShowModal(true);
    };
    const openViewModal = (company: CompanyResponseDto) => {
        setFormData({
             companyName: company. companyName,
        });

        setEditingId(company.id);
        setViewMode(true);
        setShowModal(true);
    };

    const handleViewCompany = (company: CompanyResponseDto) => {
        localStorage.setItem("company_view_id", company.id.toString());
        router.push("/admin/companies/view");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
             companyName: e.target.value,
        });
    };
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const  companyName = formData. companyName.trim();

        if (! companyName) {
            Swal.fire({
                icon: "warning",
                title: "Required Field",
                text: "Please enter company name.",
                confirmButtonColor: "#064e45",
            });
            return;
        }

        try {
            setSaving(true);

            if (editingId !== null) {
                await companyService.update({
                    id: editingId,
                     companyName,
                });

                await Swal.fire({
                    icon: "success",
                    title: "Company Updated",
                    text: "Company updated successfully!",
                    timer: 1800,
                    showConfirmButton: false,
                });
            } else {
                await companyService.create({
                     companyName,
                });

                await Swal.fire({
                    icon: "success",
                    title: "Company Added",
                    text: "Company added successfully!",
                    timer: 1800,
                    showConfirmButton: false,
                });
            }

            setShowModal(false);
            resetForm();

            await fetchCompanies();
        } catch (error: any) {
            console.error("Save company error:", error);

            Swal.fire({
                icon: "error",
                title: editingId !== null ? "Update Failed" : "Creation Failed",
                text: getErrorMessage(error),
                confirmButtonColor: "#064e45",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You want to delete this company?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#064e45",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) return;

        try {
            await companyService.delete(id);
            setCompanies((prev) =>
                prev.filter((company) => company.id !== id)
            );

            Swal.fire({
                icon: "success",
                title: "Deleted!",
                text: "Company deleted successfully.",
                timer: 1800,
                showConfirmButton: false,
            });
        } catch (error: any) {
            console.error("Delete company error:", error);

            Swal.fire({
                icon: "error",
                title: "Delete Failed",
                text: getErrorMessage(error),
                confirmButtonColor: "#064e45",
            });
        }
    };
    const filteredCompanies = useMemo(() => {
        return companies.filter((company) =>
            company. companyName?.toLowerCase().includes(search.toLowerCase())
        );
    }, [companies, search]);

    return (
        <section className="companies-page">
            <div className="companies-header">
                <div>
                    <h2>Companies</h2>
                    <p>Manage and organize your registered companies.</p>
                </div>

                <button
                    type="button"
                    className="company-add-btn"
                    onClick={openAddModal}
                >
                    <i className="bi bi-plus-lg"></i>
                    Add Company
                </button>
            </div>
            <div className="company-stats">
                <div className="company-stat-card">
                    <div className="company-stat-icon">
                        <i className="bi bi-buildings"></i>
                    </div>

                    <div>
                        <span>Total Companies</span>
                        <h3>{companies.length}</h3>
                    </div>
                </div>
            </div>
            <div className="companies-table-card">

                <div className="companies-table-header">
                    <div>
                        <h5>Company List</h5>
                        <span>All registered companies</span>
                    </div>

                    <div className="company-search">
                        <i className="bi bi-search"></i>

                        <input
                            type="text"
                            placeholder="Search companies..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table companies-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Company Name</th>
                                <th>Created Date</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4}>
                                        <div className="company-empty">
                                            <div className="spinner-border"></div>
                                            <p>Loading companies...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredCompanies.length > 0 ? (
                                filteredCompanies.map((company, index) => (
                                    <tr key={company.id}>
                                        <td>{index + 1}</td>

                                        <td>
                                            <div className="company-name-cell">
                                                <div className="company-avatar">
                                                    {company. companyName
                                                        ?.charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <strong>
                                                    {company. companyName}
                                                </strong>
                                            </div>
                                        </td>

                                        <td>
                                            {company.createdAt
                                                ? new Date(
                                                    company.createdAt
                                                ).toLocaleDateString()
                                                : "-"}
                                        </td>

                                        <td>
                                            <div className="company-actions">
                                                <button
                                                    type="button"
                                                    title="View Users"
                                                    className="view-action"
                                                    onClick={() =>
                                                        handleViewCompany(company)
                                                    }
                                                >
                                                    <i className="bi bi-people"></i>
                                                </button>
                                                <button
                                                    type="button"
                                                    title="View Details"
                                                    className="view-action"
                                                    onClick={() =>
                                                        openViewModal(company)
                                                    }
                                                >
                                                    <i className="bi bi-eye"></i>
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Edit"
                                                    className="edit-action"
                                                    onClick={() =>
                                                        openEditModal(company)
                                                    }
                                                >
                                                    <i className="bi bi-pencil-square"></i>
                                                </button>

                                                <button
                                                    type="button"
                                                    title="Delete"
                                                    className="delete-action"
                                                    onClick={() =>
                                                        handleDelete(company.id)
                                                    }
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>

                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4}>
                                        <div className="company-empty">
                                            <i className="bi bi-buildings"></i>
                                            <h5>No Companies Found</h5>
                                            <p>
                                                {search
                                                    ? "No companies match your search."
                                                    : "No companies have been registered yet."}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="companies-table-footer">
                    Showing {filteredCompanies.length} of {companies.length} companies
                </div>
            </div>
            {showModal && (
                <div
                    className="company-modal-overlay"
                    onClick={() => {
                        if (!saving) {
                            setShowModal(false);
                            resetForm();
                        }
                    }}
                >
                    <div
                        className="company-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="company-modal-header">
                            <div>
                                <h4>
                                    {viewMode
                                        ? "Company Details"
                                        : editingId !== null
                                            ? "Edit Company"
                                            : "Add Company"}
                                </h4>

                                <p>
                                    {viewMode
                                        ? "View company information"
                                        : "Enter the company name below"}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="company-modal-close"
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                                disabled={saving}
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="company-modal-body">
                                <div className="company-form-group">
                                    <label>Company Name *</label>

                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Enter company name"
                                        value={formData. companyName}
                                        onChange={handleChange}
                                        required
                                        disabled={viewMode || saving}
                                    />
                                </div>
                            </div>

                            <div className="company-modal-footer">
                                <button
                                    type="button"
                                    className="company-cancel-btn"
                                    disabled={saving}
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                >
                                    {viewMode ? "Close" : "Cancel"}
                                </button>

                                {!viewMode && (
                                    <button
                                        type="submit"
                                        className="company-save-btn"
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-check-lg"></i>
                                                {editingId !== null
                                                    ? "Update Company"
                                                    : "Save Company"}
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </section>
    );
}

export default Companies;
