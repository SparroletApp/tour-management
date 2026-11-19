
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";

import "./public-forms.css";

import formBuilderService, {
    FormResponseDto,
    UpdateFormDto
} from "@/app/apiservice/formsservice";

function PublicForm() {

    const [forms, setForms] = useState<FormResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [showEdit, setShowEdit] = useState(false);
    const [selectedForm, setSelectedForm] = useState<FormResponseDto | null>(null);

    const [formTitle, setFormTitle] = useState("");
    const [formDescription, setFormDescription] = useState("");
    const [allowMultipleSubmissions, setAllowMultipleSubmissions] = useState(true);
    const [expiryDate, setExpiryDate] = useState("");
    const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);
        }
    });

    const fetchPublicForms = async () => {
    try {
        setLoading(true);

        const response = await formBuilderService.forms.getPublicForms();

        setForms(response || []);

    } catch (error: any) {
        console.error("Error fetching public forms:", error);

        Toast.fire({
            icon: "error",
            title: error.response?.data?.message || "Failed to load public forms"
        });

    } finally {
        setLoading(false);
    }
};

useEffect(() => {
    fetchPublicForms();
}, []);

// EDIT FORM
const handleEdit = (form: FormResponseDto) => {

    setSelectedForm(form);
    setFormTitle(form.formTitle || "");
    setFormDescription(form.formDescription || "");
    setAllowMultipleSubmissions(form.allowMultipleSubmissions);

    setExpiryDate(
        form.expiryDate
            ? form.expiryDate.substring(0, 10)
            : ""
    );

    setShowEdit(true);
};

// UPDATE FORM
const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedForm) return;

    if (!formTitle.trim()) {
        Toast.fire({
            icon: "warning",
            title: "Please enter form title"
        });
        return;
    }

    const dto: UpdateFormDto = {
        id: selectedForm.id,
        companyId: null,
        packageId: selectedForm.packageId ?? null,
        formTitle: formTitle.trim(),
        formDescription,
        allowMultipleSubmissions,
        expiryDate: expiryDate || null
    };

    try {
        setSaving(true);

        await formBuilderService.forms.update(dto);

        setShowEdit(false);
        setSelectedForm(null);

        Toast.fire({
            icon: "success",
            title: "Public form updated successfully"
        });

        await fetchPublicForms();

    } catch (error: any) {
        Toast.fire({
            icon: "error",
            title: error.response?.data?.message || "Unable to update form"
        });

    } finally {
        setSaving(false);
    }
};

// DELETE FORM
const handleDelete = async (id: number) => {

    const result = await Swal.fire({
        title: "Delete Public Form?",
        text: "Are you sure you want to delete this form? This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, Delete",
        cancelButtonText: "Cancel"
    });

    if (!result.isConfirmed) return;

    try {
        await formBuilderService.forms.delete({ id });

        setForms(prev => prev.filter(form => form.id !== id));

        Toast.fire({
            icon: "success",
            title: "Public form deleted successfully"
        });

    } catch (error: any) {
        Toast.fire({
            icon: "error",
            title: error.response?.data?.message || "Unable to delete form"
        });
    }
};

    return (
        <div className="public-forms-page">
            <div className="public-forms-header">
                <div>
                    <h2>Public Forms</h2>
                    <p>Manage forms that are not associated with any company.</p>
                </div>
                <Link
                    href="/admin/public-forms/create"
                    className="public-form-add-btn"
                >
                    <i className="bi bi-plus-lg"></i>
                    Add Form
                </Link>
            </div>
            <div className="public-forms-card">
                <div className="public-forms-card-header">
                    <div>
                        <h5>Public Forms List</h5>
                        <span>{forms.length} forms available</span>
                    </div>
                    <button
                        className="public-form-refresh-btn"
                        onClick={fetchPublicForms}
                        disabled={loading}
                        type="button"
                    >
                        <i className="bi bi-arrow-clockwise"></i>
                        Refresh
                    </button>
                </div>
                {loading ? (
                    <div className="public-form-loading">
                        <div className="spinner-border text-primary"></div>
                        <p>Loading public forms...</p>
                    </div>
                ) : forms.length === 0 ? (
                    <div className="public-form-empty">
                        <i className="bi bi-file-earmark-text"></i>
                        <h5>No Public Forms Found</h5>
                        <p>Create your first public form to get started.</p>
                        <Link
                            href="/public-forms/create"
                            className="public-form-add-btn"
                        >
                            <i className="bi bi-plus-lg"></i>
                            Create Form
                        </Link>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table public-forms-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Form Title</th>
                                    <th>Slug</th>
                                    <th>Package</th>
                                    <th>Status</th>
                                    <th>Multiple Submissions</th>
                                    <th>Created Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {forms.map((form, index) => (
                                    <tr key={form.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <div className="public-form-title">
                                                {form.formTitle}
                                            </div>
                                            <small>
                                                {form.formDescription || "No description"}
                                            </small>
                                        </td>
                                        <td>
                                            <span className="public-form-slug">
                                                {form.slug}
                                            </span>
                                        </td>
                                        <td>
                                            {form.tourPackageName || "—"}
                                        </td>
                                        <td>
                                            <span className={`public-form-status ${form.status?.toLowerCase()}`}>
                                                {form.status}
                                            </span>
                                        </td>
                                        <td>
                                            {form.allowMultipleSubmissions ? "Yes" : "No"}
                                        </td>
                                        <td>
                                            {form.createdAt
                                                ? new Date(form.createdAt).toLocaleDateString()
                                                : "—"}
                                        </td>
                                        <td>
                                            <div className="public-form-actions">
                                                <Link
                                                    href={`/forms/${encodeURIComponent(form.slug)}/builder`}
                                                    className="public-form-builder-btn"
                                                    title="Open Builder"
                                                    aria-label="Open Builder"
                                                >
                                                    <i className="bi bi-layout-text-window-reverse"></i>
                                                </Link>
                                                <button
                                                    type="button"
                                                    className="public-form-edit-btn"
                                                    title="Edit Form"
                                                    aria-label="Edit Form"
                                                    onClick={() => handleEdit(form)}
                                                >
                                                    <i className="bi bi-pencil-square"></i>
                                                </button>
                                                <button
                                                    type="button"
                                                    className="public-form-delete-btn"
                                                    title="Delete Form"
                                                    aria-label="Delete Form"
                                                    onClick={() => handleDelete(form.id)}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {showEdit && selectedForm && (
                <div
                    className="public-form-modal-overlay"
                    onClick={() => setShowEdit(false)}
                >
                    <div
                        className="public-form-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="public-form-modal-header">
                            <div>
                                <h5>Edit Public Form</h5>
                                <p>Update your public form details.</p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowEdit(false)}
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <form onSubmit={handleUpdate}>

                            <div className="public-form-modal-body">

                                <div className="public-form-field">
                                    <label>Form Title *</label>
                                    <input
                                        type="text"
                                        value={formTitle}
                                        onChange={(e) => setFormTitle(e.target.value)}
                                        placeholder="Enter form title"
                                        required
                                    />
                                </div>

                                <div className="public-form-field">
                                    <label>Description</label>
                                    <textarea
                                        value={formDescription}
                                        onChange={(e) => setFormDescription(e.target.value)}
                                        placeholder="Enter form description"
                                        rows={4}
                                    />
                                </div>

                                <div className="public-form-field">
                                    <label>Expiry Date</label>
                                    <input
                                        type="date"
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                    />
                                </div>

                                <div className="public-form-checkbox">
                                    <input
                                        type="checkbox"
                                        id="allowMultipleSubmissions"
                                        checked={allowMultipleSubmissions}
                                        onChange={(e) => setAllowMultipleSubmissions(e.target.checked)}
                                    />

                                    <label htmlFor="allowMultipleSubmissions">
                                        Allow multiple submissions
                                    </label>
                                </div>

                            </div>

                            <div className="public-form-modal-footer">

                                <button
                                    type="button"
                                    className="public-form-cancel-btn"
                                    onClick={() => setShowEdit(false)}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="public-form-save-btn"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-lg"></i>
                                            Save Changes
                                        </>
                                    )}
                                </button>

                            </div>

                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

export default PublicForm;
