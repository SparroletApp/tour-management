
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Swal from "sweetalert2";
import termsService from "@/app/apiservice/termsservice";
import "./create-terms.css";

const JoditEditor = dynamic(
    () => import("jodit-react"),
    { ssr: false }
);

interface CreateTermsProps {
    onCreated?: () => void | Promise<void>;
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

function CreateTerms({ onCreated }: CreateTermsProps) {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });

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
            name: "",
            description: "",
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

        // Remove HTML tags to validate actual editor content.
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

            await termsService.create({
                companyId: Number(companyId),
                name: formData.name.trim(),
                description: formData.description,
            });

            setFormData({
                name: "",
                description: "",
            });

            setShowModal(false);

            await onCreated?.();

            Toast.fire({
                icon: "success",
                title: "Terms added successfully!",
            });

        } catch (error: any) {
            console.error("Error creating terms:", error);

            Toast.fire({
                icon: "error",
                title:
                    error?.response?.data?.message ||
                    "Failed to add terms and conditions.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="create-terms-section">

            <div className="create-terms-header">
                <div>
                    <h2>Terms & Conditions</h2>
                    <p>Manage your company terms and conditions.</p>
                </div>

                <button
                    className="add-terms-btn"
                    onClick={() => setShowModal(true)}
                    type="button"
                >
                    <i className="bi bi-plus-lg"></i>
                    Add Terms
                </button>
            </div>

            {showModal && (
                <div
                    className="terms-modal-overlay"
                    onClick={handleClose}
                >
                    <div
                        className="terms-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="terms-modal-header">
                            <div>
                                <h3>Add Terms & Conditions</h3>
                                <p>Create a new company term.</p>
                            </div>

                            <button
                                type="button"
                                className="terms-close-btn"
                                onClick={handleClose}
                                disabled={loading}
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="terms-modal-body">

                                <div className="terms-form-group">
                                    <label htmlFor="termsName">
                                        Terms Name <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        id="termsName"
                                        name="name"
                                        placeholder="Enter terms name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        maxLength={255}
                                        required
                                    />
                                </div>

                                <div className="terms-form-group">
                                    <label>
                                        Description <span>*</span>
                                    </label>

                                    <div className="terms-jodit-editor">
                                        <JoditEditor
                                            value={formData.description}
                                            config={editorConfig}
                                            onBlur={(content) => {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    description: content,
                                                }));
                                            }}
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

                            <div className="terms-modal-footer">
                                <button
                                    type="button"
                                    className="terms-cancel-btn"
                                    onClick={handleClose}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="terms-save-btn"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="terms-spinner"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-lg"></i>
                                            Save Terms
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </section>
    );
}

export default CreateTerms;
