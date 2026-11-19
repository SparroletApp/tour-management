
"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { MouseEvent } from "react";
import Link from "next/link";
import Swal from "sweetalert2";

import "./forms.css";
import formBuilderService, {
    FormResponseDto
} from "../apiservice/formsservice";
import { useRouter } from "next/navigation";

export default function Forms() {
    const [forms, setForms] = useState<FormResponseDto[]>([]);
    const [publicForms, setPublicForms] = useState<FormResponseDto[]>([]);

    const [loading, setLoading] = useState(true);
    const [publicLoading, setPublicLoading] = useState(true);
    const [error, setError] = useState("");

    const [companyId, setCompanyId] = useState<number | null>(null);

    const [openMenu, setOpenMenu] = useState<number | null>(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

    const [mounted, setMounted] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const router = useRouter();
    const [creatingTemplateId, setCreatingTemplateId] = useState<number | null>(null);

    useEffect(() => {
        setMounted(true);

        const storedCompanyId = sessionStorage.getItem("company_id");

        if (!storedCompanyId || isNaN(Number(storedCompanyId))) {
            setError("Company ID not found. Please login again.");
            setLoading(false);
            setPublicLoading(false);
            return;
        }

        const id = Number(storedCompanyId);
        setCompanyId(id);

        loadForms(id);
        loadPublicForms();
    }, []);

    // COMPANY FORMS
    const loadForms = async (id: number) => {
        try {
            setLoading(true);

            const data = await formBuilderService.forms.getByCompany({
                companyId: id
            });

            setForms(data || []);
            setError("");
            setCurrentPage(1);
        } catch (err) {
            console.error(err);
            setError("Unable to load forms.");
        } finally {
            setLoading(false);
        }
    };

    // PUBLIC TEMPLATE FORMS
    const loadPublicForms = async () => {
        try {
            setPublicLoading(true);

            const data = await formBuilderService.forms.getPublicForms();

            setPublicForms(data || []);
        } catch (err) {
            console.error("Error loading public forms:", err);
            setPublicForms([]);
        } finally {
            setPublicLoading(false);
        }
    };

    const sortedForms = useMemo(() => {
        return [...forms].sort((a, b) => {
            const dateA = a.createdAt
                ? new Date(a.createdAt).getTime()
                : 0;

            const dateB = b.createdAt
                ? new Date(b.createdAt).getTime()
                : 0;

            return dateB - dateA;
        });
    }, [forms]);

    const totalForms = sortedForms.length;
    const totalPages = Math.ceil(totalForms / pageSize);

    const paginatedForms = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;

        return sortedForms.slice(startIndex, startIndex + pageSize);
    }, [sortedForms, currentPage, pageSize]);

    const startRecord =
        totalForms === 0 ? 0 : (currentPage - 1) * pageSize + 1;

    const endRecord = Math.min(currentPage * pageSize, totalForms);

    const closeMenu = () => setOpenMenu(null);

    const changePage = (page: number) => {
        if (page < 1 || page > totalPages) return;

        setCurrentPage(page);
        closeMenu();
    };

    const handlePageSizeChange = (value: number) => {
        setPageSize(value);
        setCurrentPage(1);
        closeMenu();
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
            if (event.key === "Escape") closeMenu();
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

            if (companyId !== null) {
                await loadForms(companyId);
            }

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

            if (companyId !== null) {
                await loadForms(companyId);
            }

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

    const useTemplate = async (template: FormResponseDto) => {
        const storedCompanyId = sessionStorage.getItem("company_id");

        if (!storedCompanyId || isNaN(Number(storedCompanyId))) {
            showToast("error", "Company ID not found. Please login again.");
            return;
        }

        const loggedInCompanyId = Number(storedCompanyId);

        const result = await Swal.fire({
            title: "Use this template?",
            text: `A separate copy of "${template.formTitle}" will be created for your company.`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Create My Form",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#064e45",
            reverseButtons: true
        });

        if (!result.isConfirmed) return;

        setCreatingTemplateId(template.id);

        Swal.fire({
            title: "Creating Your Form",
            text: "Copying template, sections and questions. Please wait...",
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        let newFormId: number | null = null;

        try {
            const originalSections =
                await formBuilderService.sections.getByForm({
                    id: template.id
                });
            const createdForm = await formBuilderService.forms.create({
                companyId: loggedInCompanyId,
                packageId: null,
                formTitle: template.formTitle,
                formDescription: template.formDescription || "",
                allowMultipleSubmissions: template.allowMultipleSubmissions,
                expiryDate: null
            });

            if (!createdForm || !createdForm.id) {
                throw new Error("Unable to create the new form.");
            }

            newFormId = createdForm.id;
            const sortedSections = [...(originalSections || [])].sort(
                (a, b) => a.displayOrder - b.displayOrder
            );

            for (const originalSection of sortedSections) {
                const newSection =
                    await formBuilderService.sections.create({
                        formId: newFormId,
                        sectionTitle: originalSection.sectionTitle,
                        sectionDescription:
                            originalSection.sectionDescription || "",
                        displayOrder: originalSection.displayOrder
                    });

                if (!newSection || !newSection.id) {
                    throw new Error(
                        `Unable to copy section: ${originalSection.sectionTitle}`
                    );
                }
                const originalQuestions =
                    await formBuilderService.questions.getBySection({
                        id: originalSection.id
                    });

                const sortedQuestions = [...(originalQuestions || [])].sort(
                    (a, b) => a.displayOrder - b.displayOrder
                );
                for (const question of sortedQuestions) {
                    await formBuilderService.questions.create({
                        sectionId: newSection.id,
                        questionTitle: question.questionTitle,
                        fieldType: question.fieldType,
                        required: question.required,
                        placeholder: question.placeholder || "",
                        helpText: question.helpText || "",
                        options: question.options || "",
                        displayOrder: question.displayOrder
                    });
                }
            }
            let newSlug = createdForm.slug;

            if (!newSlug) {
                const refreshedForm =
                    await formBuilderService.forms.getById({
                        id: newFormId
                    });

                newSlug = refreshedForm.slug;
            }
            if (!newSlug) {
                throw new Error(
                    "New form was created, but its slug was not returned by the backend."
                );
            }
            Swal.close();

            showToast("success", "Template copied successfully!");

            router.push(`/forms/${newSlug}/builder`);

        } catch (err: any) {
            console.error("Template creation error:", err);
            if (newFormId !== null) {
                try {
                    await formBuilderService.forms.delete({
                        id: newFormId
                    });
                } catch (deleteError) {
                    console.error(
                        "Unable to clean up partially created form:",
                        deleteError
                    );
                }
            }

            Swal.close();

            Swal.fire({
                icon: "error",
                title: "Template Creation Failed",
                text:
                    err?.response?.data?.message ||
                    err?.message ||
                    "Unable to create form from this template.",
                confirmButtonColor: "#064e45"
            });

        } finally {
            setCreatingTemplateId(null);
        }
    };

    const routerToTemplate = (slug: string) => {
        window.location.href = `/forms/create?template=${encodeURIComponent(slug)}`;
    };

    const getTemplateIcon = (index: number) => {
        const icons = [
            "bi-file-earmark-text",
            "bi-calendar-check",
            "bi-person-lines-fill",
            "bi-clipboard-check",
            "bi-airplane",
            "bi-card-checklist"
        ];

        return icons[index % icons.length];
    };

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

            <div className="forms-dashboard-layout">

                <aside className="public-templates-sidebar">

                    <div className="templates-sidebar-heading">
                        <div>
                            <p>Start with a ready-made template</p>
                        </div>

                        <span className="templates-count">
                            {publicForms.length}
                        </span>
                    </div>

                    {publicLoading ? (
                        <div className="templates-loading">
                            <div className="forms-spinner"></div>
                            <span>Loading templates...</span>
                        </div>
                    ) : publicForms.length === 0 ? (
                        <div className="templates-empty">
                            <i className="bi bi-file-earmark-plus"></i>
                            <p>No public templates available.</p>
                        </div>
                    ) : (
                        <div className="public-template-list">

                            {publicForms.map((form, index) => (
                                <div
                                    className="public-template-card"
                                    key={form.id}
                                >
                                    <div className={`template-card-banner template-banner-${index % 6}`}>
                                        <div className="template-card-icon">
                                            <i className={`bi ${getTemplateIcon(index)}`}></i>
                                        </div>

                                        <span className="template-label">
                                            TEMPLATE
                                        </span>
                                    </div>

                                    <div className="template-card-content">

                                        <h4>{form.formTitle}</h4>

                                        <p>
                                            {form.formDescription ||
                                                "Ready-to-use form template."}
                                        </p>

                                        <div className="template-card-footer">
                                            <span>
                                                <i className="bi bi-globe2"></i>
                                                Public
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() => useTemplate(form)}
                                            >
                                                Use template
                                                <i className="bi bi-arrow-right"></i>
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            ))}

                        </div>
                    )}

                </aside>

                {/* RIGHT FORMS TABLE */}
                <main className="forms-main-content">

                    <div className="forms-main-heading">
                        <div>
                            <h2>My Forms</h2>
                            <p>Manage all your created forms here.</p>
                        </div>

                        <span className="my-forms-count">
                            {forms.length} Forms
                        </span>
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
                        <>
                            <div className="forms-table-wrapper">
                                <table className="forms-table">
                                    <thead>
                                        <tr>
                                            <th>Form Name</th>
                                            <th>Status</th>
                                            <th>Multiple Submissions</th>
                                            <th>Created</th>
                                            <th className="forms-actions-heading">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {paginatedForms.map((form) => (
                                            <tr key={form.id}>
                                                <td className="forms-name-cell">
                                                    <strong>{form.formTitle}</strong>
                                                    <small>
                                                        {form.formDescription || "No description"}
                                                    </small>
                                                </td>

                                                <td>
                                                    <span className={`form-status ${form.status.toLowerCase()}`}>
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
                                                                className={`action-icon-btn more-btn ${openMenu === form.id ? "active" : ""}`}
                                                                data-tooltip="More Actions"
                                                                aria-label="More Actions"
                                                                aria-expanded={openMenu === form.id}
                                                                onClick={(event) => toggleMenu(form.id, event)}
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

                            {/* PAGINATION */}
                            <div className="forms-pagination">

                                <div className="forms-pagination-info">
                                    <span>Showing</span>
                                    <strong>{startRecord}-{endRecord}</strong>
                                    <span>of</span>
                                    <strong>{totalForms}</strong>
                                    <span>forms</span>
                                </div>

                                <div className="forms-pagination-controls">

                                    <div className="forms-page-size">
                                        <label htmlFor="forms-page-size">
                                            Rows per page
                                        </label>

                                        <select
                                            id="forms-page-size"
                                            value={pageSize}
                                            onChange={(e) =>
                                                handlePageSizeChange(Number(e.target.value))
                                            }
                                        >
                                            <option value={10}>10</option>
                                            <option value={20}>20</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                        </select>
                                    </div>

                                    <div className="forms-page-buttons">

                                        <button
                                            type="button"
                                            className="forms-page-btn"
                                            disabled={currentPage === 1}
                                            onClick={() => changePage(currentPage - 1)}
                                        >
                                            <i className="bi bi-chevron-left"></i>
                                        </button>

                                        {Array.from(
                                            { length: totalPages },
                                            (_, index) => index + 1
                                        )
                                            .filter((page) =>
                                                page === 1 ||
                                                page === totalPages ||
                                                Math.abs(page - currentPage) <= 1
                                            )
                                            .map((page, index, pages) => (
                                                <span key={page} className="forms-page-item">
                                                    {index > 0 &&
                                                        page - pages[index - 1] > 1 && (
                                                            <span className="forms-page-dots">...</span>
                                                        )}

                                                    <button
                                                        type="button"
                                                        className={`forms-page-btn ${currentPage === page ? "active" : ""}`}
                                                        onClick={() => changePage(page)}
                                                    >
                                                        {page}
                                                    </button>
                                                </span>
                                            ))}

                                        <button
                                            type="button"
                                            className="forms-page-btn"
                                            disabled={currentPage === totalPages}
                                            onClick={() => changePage(currentPage + 1)}
                                        >
                                            <i className="bi bi-chevron-right"></i>
                                        </button>

                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                </main>
            </div>

            {/* ACTION DROPDOWN */}
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
                                    onClick={() => changeStatus(selectedForm.id, "publish")}
                                >
                                    <i className="bi bi-send-check"></i>
                                    <span>Publish Form</span>
                                </button>
                            )}

                            {selectedForm.status === "PUBLISHED" && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => copyFormLink(selectedForm.slug)}
                                        disabled={!selectedForm.slug}
                                    >
                                        <i className="bi bi-link-45deg"></i>
                                        <span>Copy Public Link</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => shareWhatsApp(selectedForm.slug, selectedForm.formTitle)}
                                        disabled={!selectedForm.slug}
                                    >
                                        <i className="bi bi-whatsapp whatsapp-icon"></i>
                                        <span>Share on WhatsApp</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => shareEmail(selectedForm.slug, selectedForm.formTitle)}
                                        disabled={!selectedForm.slug}
                                    >
                                        <i className="bi bi-envelope"></i>
                                        <span>Share via Email</span>
                                    </button>

                                    <div className="dropdown-divider"></div>

                                    <button
                                        type="button"
                                        onClick={() => changeStatus(selectedForm.id, "close")}
                                    >
                                        <i className="bi bi-lock"></i>
                                        <span>Close Form</span>
                                    </button>
                                </>
                            )}

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
