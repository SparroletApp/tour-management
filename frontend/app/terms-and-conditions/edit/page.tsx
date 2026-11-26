
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Swal from "sweetalert2";
import termsService, { Terms } from "@/app/apiservice/termsservice";
import "./edit-terms.css";

const JoditEditor = dynamic(
    () => import("jodit-react"),
    { ssr: false }
);

interface EditTermsProps {
    term: Terms;
    onUpdated?: () => void | Promise<void>;
}

const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
});

const editorConfig = {
    readonly: false,
    height: 300,
    placeholder: "Enter terms and conditions description...",
    toolbar: true,
    spellcheck: true,
    language: "en",
    toolbarButtonSize: "middle" as const,
    buttons: [
        "bold",
        "italic",
        "underline",
        "|",
        "ul",
        "ol",
        "|",
        "font",
        "fontsize",
        "paragraph",
        "|",
        "align",
        "outdent",
        "indent",
        "|",
        "link",
        "table",
        "|",
        "undo",
        "redo",
        "|",
        "hr",
        "eraser",
        "fullsize",
    ],
    showCharsCounter: true,
    showWordsCounter: true,
    showXPathInStatusbar: false,
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
};

function EditTerms({ term, onUpdated }: EditTermsProps) {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: term.name,
        description: term.description || "",
    });

    useEffect(() => {
        setFormData({
            name: term.name,
            description: term.description || "",
        });
    }, [term]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleClose = () => {
        if (loading) return;

        setShowModal(false);

        setFormData({
            name: term.name,
            description: term.description || "",
        });
    };

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        const companyId = sessionStorage.getItem("company_id");

        if (!companyId) {
            Toast.fire({
                icon: "error",
                title: "Company ID not found. Please login again.",
            });
            return;
        }

        const plainDescription = formData.description
            .replace(/<[^>]*>/g, "")
            .replace(/&nbsp;/gi, " ")
            .replace(/&#160;/g, " ")
            .trim();

        if (!formData.name.trim() || !plainDescription) {
            Toast.fire({
                icon: "warning",
                title: "Please fill in all fields.",
            });
            return;
        }

        try {
            setLoading(true);

            await termsService.update({
                id: term.id,
                companyId: Number(companyId),
                name: formData.name.trim(),
                description: formData.description,
            });

            setShowModal(false);

            await onUpdated?.();

            Toast.fire({
                icon: "success",
                title: "Terms updated successfully!",
            });

        } catch (error: any) {
            console.error("Error updating terms:", error);

            Toast.fire({
                icon: "error",
                title:
                    error?.response?.data?.message ||
                    "Failed to update terms and conditions.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                type="button"
                className="edit-terms-btn"
                onClick={() => setShowModal(true)}
                title="Edit Terms"
                aria-label="Edit Terms"
            >
                <i className="bi bi-pencil-square"></i>
            </button>

            {showModal && (
                <div
                    className="edit-terms-overlay"
                    onClick={handleClose}
                >
                    <div
                        className="edit-terms-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="edit-terms-modal-header">
                            <div>
                                <h3>Edit Terms & Conditions</h3>
                                <p>Update your company terms and conditions.</p>
                            </div>

                            <button
                                type="button"
                                className="edit-terms-close"
                                onClick={handleClose}
                                disabled={loading}
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="edit-terms-modal-body">

                                <div className="edit-terms-form-group">
                                    <label htmlFor={`edit-terms-name-${term.id}`}>
                                        Terms Name <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        id={`edit-terms-name-${term.id}`}
                                        name="name"
                                        placeholder="Enter terms name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        maxLength={255}
                                        required
                                    />
                                </div>

                                <div className="edit-terms-form-group">
                                    <label>
                                        Description <span>*</span>
                                    </label>

                                    <div className="edit-terms-jodit-editor">
                                        <JoditEditor
                                            key={term.id}
                                            value={formData.description}
                                            config={editorConfig}
                                            onChange={(content) => {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    description: content,
                                                }));
                                            }}
                                        />
                                    </div>
                                </div>

                            </div>

                            <div className="edit-terms-modal-footer">
                                <button
                                    type="button"
                                    className="edit-terms-cancel"
                                    onClick={handleClose}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="edit-terms-save"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="edit-terms-spinner"></span>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-lg"></i>
                                            Update Terms
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default EditTerms;
