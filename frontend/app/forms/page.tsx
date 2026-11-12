
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { MouseEvent } from "react";
import Link from "next/link";
import Swal from "sweetalert2";

import "./forms.css";
import formBuilderService, { FormResponseDto } from "../apiservice/formsservice";

export default function Forms() {
    const [forms, setForms] = useState<FormResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [openMenu, setOpenMenu] = useState<number | null>(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        loadForms();
    }, []);

    const loadForms = async () => {
        try {
            setLoading(true);

            const data = await formBuilderService.forms.getAll();

            setForms(data);
            setError("");
        } catch (err) {
            console.error(err);
            setError("Unable to load forms.");
        } finally {
            setLoading(false);
        }
    };

    const closeMenu = () => {
        setOpenMenu(null);
    };

    const toggleMenu = (
        id: number,
        event: MouseEvent<HTMLButtonElement>
    ) => {
        if (openMenu === id) {
            closeMenu();
            return;
        }

        const rect = event.currentTarget.getBoundingClientRect();

        const dropdownWidth = 205;
        const dropdownHeight = 250;

        let left = rect.right - dropdownWidth;
        let top = rect.bottom + 9;

        left = Math.max(
            10,
            Math.min(left, window.innerWidth - dropdownWidth - 10)
        );

        if (top + dropdownHeight > window.innerHeight - 10) {
            top = Math.max(10, rect.top - dropdownHeight - 9);
        }

        setMenuPosition({ top, left });
        setOpenMenu(id);
    };

    useEffect(() => {
        if (openMenu === null) return;

        const handleScroll = () => closeMenu();
        const handleResize = () => closeMenu();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                closeMenu();
            }
        };

        window.addEventListener("scroll", handleScroll, true);
        window.addEventListener("resize", handleResize);
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("scroll", handleScroll, true);
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [openMenu]);

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
            timerProgressBar: true
        });
    };

    const deleteForm = async (id: number) => {
        closeMenu();

        const result = await Swal.fire({
            title: "Delete Form?",
            text: "Are you sure you want to delete this form? This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#dc3545",
            cancelButtonColor: "#6c757d",
            reverseButtons: true
        });

        if (!result.isConfirmed) return;

        try {
            await formBuilderService.forms.delete({ id });

            await loadForms();

            showToast("success", "Form deleted successfully!");
        } catch (err) {
            console.error(err);

            showToast("error", "Unable to delete form.");
        }
    };

    const changeStatus = async (
        id: number,
        action: "publish" | "close"
    ) => {
        closeMenu();

        try {
            if (action === "publish") {
                await formBuilderService.forms.publish({ id });
            } else {
                await formBuilderService.forms.close({ id });
            }

            await loadForms();

            showToast(
                "success",
                action === "publish"
                    ? "Form published successfully!"
                    : "Form closed successfully!"
            );
        } catch (err) {
            console.error(err);

            showToast(
                "error",
                action === "publish"
                    ? "Unable to publish form."
                    : "Unable to close form."
            );
        }
    };

    const getPublicUrl = (slug: string) => {
        return `${window.location.origin}/tour-form/${slug}`;
    };

    const copyFormLink = async (slug: string) => {
        try {
            await navigator.clipboard.writeText(getPublicUrl(slug));

            closeMenu();

            showToast("success", "Form link copied successfully!");
        } catch (err) {
            console.error(err);

            showToast("error", "Unable to copy form link.");
        }
    };

    const shareWhatsApp = (slug: string, title: string) => {
        const url = getPublicUrl(slug);

        const message = `Hello! Please fill out the form "${title}" using the link below:\n\n${url}`;

        closeMenu();

        window.open(
            `https://wa.me/?text=${encodeURIComponent(message)}`,
            "_blank",
            "noopener,noreferrer"
        );
    };

    const shareEmail = (slug: string, title: string) => {
        const url = getPublicUrl(slug);

        const subject = `Please complete: ${title}`;

        const body = `Hello,\n\nPlease fill out the following form:\n\n${url}\n\nThank you.`;

        closeMenu();

        window.location.href =
            `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const selectedForm = forms.find(
        (form) => form.id === openMenu
    );

    return (
        <section className="forms">
  
            <div className="forms-header">
                <div>
                    <h1>Forms</h1>
                    <p>Create and manage your dynamic forms.</p>
                </div>

                <Link href="/forms/create" className="forms-primary-btn">
                    <i className="bi bi-plus-lg"></i>
                    Create Form
                </Link>
            </div>

            {loading && (
                <div className="forms-loading">
                    <div className="forms-spinner"></div>
                    <p>Loading forms...</p>
                </div>
            )}

            {error && (
                <div className="forms-error">
                    <i className="bi bi-exclamation-circle"></i>
                    {error}
                </div>
            )}
            {!loading && !error && forms.length === 0 && (
                <div className="forms-empty">
                    <div className="forms-empty-icon">
                        <i className="bi bi-file-earmark-text"></i>
                    </div>

                    <h3>No forms created yet</h3>
                    <p>Create your first form to get started.</p>

                    <Link href="/forms/create" className="forms-primary-btn">
                        <i className="bi bi-plus-lg"></i>
                        Create Form
                    </Link>
                </div>
            )}

            {!loading && !error && forms.length > 0 && (
                <div className="forms-table-wrapper">
                    <table className="forms-table">
                        <thead>
                            <tr>
                                <th>Form Name</th>
                                <th>Status</th>
                                <th>Multiple Submissions</th>
                                <th>Created</th>
                                <th className="forms-actions-heading">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {forms.map((form) => (
                                <tr key={form.id}>
                                    <td className="forms-name-cell">
                                        <strong>{form.formTitle}</strong>
                                        <small>
                                            {form.formDescription || "No description"}
                                        </small>
                                    </td>

                                    <td>
                                        <span
                                            className={`form-status ${form.status.toLowerCase()}`}
                                        >
                                            <span className="status-dot"></span>
                                            {form.status}
                                        </span>
                                    </td>

                                    <td>
                                        <span className="forms-submission-text">
                                            {form.allowMultipleSubmissions
                                                ? "Allowed"
                                                : "Not allowed"}
                                        </span>
                                    </td>

                                    <td>
                                        <span className="forms-date">
                                            {form.createdAt
                                                ? new Date(form.createdAt).toLocaleDateString()
                                                : "-"}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="forms-actions">

                                            <Link
                                                href={`/forms/${form.slug}/builder`}
                                                className="action-icon-btn"
                                                data-tooltip="Open Builder"
                                                aria-label="Open Builder"
                                            >
                                                <i className="bi bi-layout-text-window-reverse"></i>
                                            </Link>

                                            <Link
                                                href={`/forms/${form.slug}/edit`}
                                                className="action-icon-btn"
                                                data-tooltip="Edit Form"
                                                aria-label="Edit Form"
                                            >
                                                <i className="bi bi-pencil-square"></i>
                                            </Link>

                                            <Link
                                                href={`/forms/${form.slug}/submissions`}
                                                className="action-icon-btn"
                                                data-tooltip="View Responses"
                                                aria-label="View Responses"
                                            >
                                                <i className="bi bi-chat-left-text"></i>
                                            </Link>

                                            <div className="forms-more-wrapper">
                                                <button
                                                    type="button"
                                                    className={`action-icon-btn more-btn ${openMenu === form.id ? "active" : ""
                                                        }`}
                                                    data-tooltip="More Actions"
                                                    aria-label="More Actions"
                                                    aria-expanded={openMenu === form.id}
                                                    onClick={(event) =>
                                                        toggleMenu(form.id, event)
                                                    }
                                                >
                                                    <i className="bi bi-three-dots-vertical"></i>
                                                </button>
                                            </div>

                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {mounted && openMenu !== null && selectedForm &&
                createPortal(
                    <>
                        <div
                            className="forms-menu-overlay"
                            onClick={closeMenu}
                        />

                        <div
                            className="forms-dropdown forms-dropdown-portal"
                            style={{
                                top: `${menuPosition.top}px`,
                                left: `${menuPosition.left}px`
                            }}
                        >
                            {selectedForm.status === "DRAFT" && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        changeStatus(selectedForm.id, "publish")
                                    }
                                >
                                    <i className="bi bi-send-check"></i>
                                    <span>Publish Form</span>
                                </button>
                            )}

                            {selectedForm.status === "PUBLISHED" && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            copyFormLink(selectedForm.slug)
                                        }
                                        disabled={!selectedForm.slug}
                                    >
                                        <i className="bi bi-link-45deg"></i>
                                        <span>Copy Public Link</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            shareWhatsApp(
                                                selectedForm.slug,
                                                selectedForm.formTitle
                                            )
                                        }
                                        disabled={!selectedForm.slug}
                                    >
                                        <i className="bi bi-whatsapp whatsapp-icon"></i>
                                        <span>Share on WhatsApp</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            shareEmail(
                                                selectedForm.slug,
                                                selectedForm.formTitle
                                            )
                                        }
                                        disabled={!selectedForm.slug}
                                    >
                                        <i className="bi bi-envelope"></i>
                                        <span>Share via Email</span>
                                    </button>

                                    <div className="dropdown-divider"></div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            changeStatus(selectedForm.id, "close")
                                        }
                                    >
                                        <i className="bi bi-lock"></i>
                                        <span>Close Form</span>
                                    </button>
                                </>
                            )}

                            {/* {selectedForm.status === "CLOSED" && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        changeStatus(selectedForm.id, "publish")
                                    }
                                >
                                    <i className="bi bi-arrow-repeat"></i>
                                    <span>Reopen Form</span>
                                </button>
                            )} */}

                            <div className="dropdown-divider"></div>

                            <button
                                type="button"
                                className="dropdown-delete"
                                onClick={() => deleteForm(selectedForm.id)}
                            >
                                <i className="bi bi-trash3"></i>
                                <span>Delete Form</span>
                            </button>
                        </div>
                    </>,
                    document.body
                )
            }

        </section>
    );
}
