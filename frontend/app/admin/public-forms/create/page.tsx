
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";

import "./create-forms.css";
import formBuilderService from "@/app/apiservice/formsservice";

export default function CreatePublicForm() {
    const router = useRouter();

    const [formTitle, setFormTitle] = useState("");
    const [formDescription, setFormDescription] = useState("");
    const [allowMultipleSubmissions, setAllowMultipleSubmissions] =
        useState(true);
    const [expiryDate, setExpiryDate] = useState("");
    const [loading, setLoading] = useState(false);

    // Reusable Toast Configuration
    const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
        },
    });

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!formTitle.trim()) {
            Toast.fire({
                icon: "warning",
                title: "Please enter a form title.",
            });
            return;
        }

        try {
            setLoading(true);

            const response = await formBuilderService.forms.create({
                companyId: null,
                packageId: null,
                formTitle: formTitle.trim(),
                formDescription: formDescription.trim(),
                allowMultipleSubmissions,
                expiryDate: expiryDate || null,
            });

            if (!response?.slug) {
                Toast.fire({
                    icon: "error",
                    title: "Form created, but slug was not returned.",
                });
                return;
            }

            await Toast.fire({
                icon: "success",
                title: "Public form created successfully!",
            });

            router.push(
                `/forms/${encodeURIComponent(response.slug)}/builder`
            );

        } catch (error: any) {
            console.error("Public form creation error:", error);

            Toast.fire({
                icon: "error",
                title:
                    error.response?.data?.message ||
                    "Unable to create public form.",
            });

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="whole-contain-form">
            <section className="create-form">

                <Link href="/admin/public-forms" className="forms-back-link">
                    <i className="bi bi-arrow-left"></i>
                    <span>Back to Forms</span>
                </Link>

                <div className="create-form-header">
                    <div>
                        <h1>Create Public Form</h1>
                        <p>
                            Create a form that anyone can access and submit
                            without assigning a company or tour package.
                        </p>
                    </div>
                </div>

                <form
                    className="create-form-card"
                    onSubmit={handleSubmit}
                >
                    <div className="public-form-notice">
                        <i className="bi bi-globe2"></i>
                        <div>
                            <strong>Public Form</strong>
                            <p>
                                This form will not be linked to any company
                                or tour package.
                            </p>
                        </div>
                    </div>

                    <div className="form-field">
                        <label>Form Title *</label>
                        <input
                            type="text"
                            value={formTitle}
                            onChange={(e) => setFormTitle(e.target.value)}
                            placeholder="Enter public form title"
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
                            onChange={(e) => setExpiryDate(e.target.value)}
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
                            className="form-primary-btn"
                            disabled={loading}
                        >
                            {loading ? "Creating..." : "Create Public Form"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}
