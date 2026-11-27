
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./forms-submissions.css";

import formBuilderService, {
    SubmissionResponseDto
} from "@/app/apiservice/formsservice";

import Swal from "sweetalert2";

type ExportColumn = {
    key: string;
    label: string;
    getValue: (submission: SubmissionResponseDto) => string | number;
};

export default function FormSubmissions() {
    const router = useRouter();

    const [submissions, setSubmissions] = useState<SubmissionResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [packageId, setPackageId] = useState<number | null>(null);

    const [showExportModal, setShowExportModal] = useState(false);

    const exportColumns: ExportColumn[] = [
        {
            key: "id",
            label: "Submission ID",
            getValue: (s) => s.id
        },
        {
            key: "formTitle",
            label: "Form Title",
            getValue: (s) => s.formTitle || "-"
        },
        {
            key: "respondentName",
            label: "Respondent Name",
            getValue: (s) => s.respondentName || "Anonymous"
        },
        {
            key: "respondentEmail",
            label: "Email Address",
            getValue: (s) => s.respondentEmail || "-"
        },
        {
            key: "respondentPhone",
            label: "Phone Number",
            getValue: (s) => s.respondentPhone || "-"
        },
        {
            key: "couponCode",
            label: "Coupon Code",
            getValue: (s) => s.couponCode || "-"
        },
        {
            key: "discountPercentage",
            label: "Discount Percentage",
            getValue: (s) =>
                s.discountPercentage != null
                    ? `${s.discountPercentage}%`
                    : "-"
        },
        {
            key: "status",
            label: "Status",
            getValue: (s) => s.status || "-"
        },
        {
            key: "submittedAt",
            label: "Submitted Date",
            getValue: (s) =>
                s.submittedAt
                    ? new Date(s.submittedAt).toLocaleString()
                    : "-"
        }
    ];

    const [selectedColumns, setSelectedColumns] = useState<string[]>(
        exportColumns.map((column) => column.key)
    );

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
            timer: 3000,
            timerProgressBar: true
        });
    };

    useEffect(() => {
        const loadSubmissions = async () => {
            try {
                setLoading(true);

                const storedPackageId = localStorage.getItem("form_package_id");

                if (
                    !storedPackageId ||
                    !Number.isInteger(Number(storedPackageId)) ||
                    Number(storedPackageId) <= 0
                ) {
                    throw new Error(
                        "Package ID not found. Please select a tour again."
                    );
                }

                const selectedPackageId = Number(storedPackageId);

                setPackageId(selectedPackageId);

                const response =
                    await formBuilderService.submissions.getByPackage({
                        packageId: selectedPackageId
                    });

                setSubmissions(response);

            } catch (error: any) {
                console.error(error);

                showToast(
                    "error",
                    error?.response?.data?.message ||
                    error?.message ||
                    "Unable to load submissions."
                );
            } finally {
                setLoading(false);
            }
        };

        loadSubmissions();
    }, []);

    const deleteSubmission = async (id: number) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "Do you want to delete this submission and its answers?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it",
            cancelButtonText: "Cancel",
            reverseButtons: true,
            confirmButtonColor: "#dc3545",
            cancelButtonColor: "#6c757d"
        });

        if (!result.isConfirmed) return;

        try {
            await formBuilderService.submissions.delete({ id });

            setSubmissions((previous) =>
                previous.filter((item) => item.id !== id)
            );

            showToast("success", "Submission deleted successfully!");

        } catch (error: any) {
            console.error(error);

            showToast(
                "error",
                error?.response?.data?.message ||
                "Unable to delete submission."
            );
        }
    };

    const toggleColumn = (key: string) => {
        setSelectedColumns((previous) =>
            previous.includes(key)
                ? previous.filter((item) => item !== key)
                : [...previous, key]
        );
    };

    const selectAllColumns = () => {
        setSelectedColumns(exportColumns.map((column) => column.key));
    };

    const clearAllColumns = () => {
        setSelectedColumns([]);
    };

    const exportCSV = () => {
        if (submissions.length === 0) {
            showToast("warning", "No submissions available to export.");
            return;
        }

        if (selectedColumns.length === 0) {
            showToast("warning", "Please select at least one column.");
            return;
        }

        const columns = exportColumns.filter((column) =>
            selectedColumns.includes(column.key)
        );

        const escapeCSV = (value: string | number) => {
            const text = String(value ?? "");
            return `"${text.replace(/"/g, '""')}"`;
        };

        const headers = columns.map((column) =>
            escapeCSV(column.label)
        );

        const rows = submissions.map((submission) =>
            columns.map((column) =>
                escapeCSV(column.getValue(submission))
            )
        );

        const csvContent = [
            headers.join(","),
            ...rows.map((row) => row.join(","))
        ].join("\r\n");

        // UTF-8 BOM for proper Excel compatibility
        const blob = new Blob(
            ["\uFEFF" + csvContent],
            { type: "text/csv;charset=utf-8;" }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `form-submissions-package-${packageId || "all"}-${new Date()
            .toISOString()
            .slice(0, 10)}.csv`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        setShowExportModal(false);

        showToast("success", "Submissions exported successfully!");
    };

    return (
        <main className="submissions-page">

            <header className="submissions-header">
                <div>
                    <h1>Form Submissions</h1>

                    <p>
                        {packageId
                            ? `Submissions for Tour Package #${packageId}`
                            : "View all responses received for this tour."}
                    </p>
                </div>

                <div className="submissions-header-actions">

                    {!loading && submissions.length > 0 && (
                        <button
                            type="button"
                            className="export-submissions-btn"
                            onClick={() => setShowExportModal(true)}
                        >
                            <i className="bi bi-file-earmark-spreadsheet"></i>
                            Export Submissions
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => router.push("/tours")}
                    >
                        <i className="bi bi-arrow-left"></i>
                        Back to Tours
                    </button>

                </div>
            </header>

            {loading ? (
                <p>Loading submissions...</p>

            ) : submissions.length === 0 ? (
                <div className="submissions-empty">
                    <h3>No submissions yet</h3>

                    <p>
                        Responses will appear here after users submit the form.
                    </p>
                </div>

            ) : (
                <div className="submissions-table-wrapper">

                    <table className="submissions-table">

                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Form</th>
                                <th>Respondent</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Coupon Code</th>
                                <th>Discount</th>
                                <th>Status</th>
                                <th>Submitted At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {submissions.map((submission, index) => (
                                <tr key={submission.id}>

                                    <td>{index + 1}</td>

                                    <td>{submission.formTitle || "-"}</td>

                                    <td>
                                        {submission.respondentName || "Anonymous"}
                                    </td>

                                    <td>
                                        {submission.respondentEmail || "-"}
                                    </td>

                                    <td>
                                        {submission.respondentPhone || "-"}
                                    </td>

                                    <td>
                                        {submission.couponCode || "-"}
                                    </td>

                                    <td>
                                        {submission.discountPercentage != null
                                            ? `${submission.discountPercentage}%`
                                            : "-"}
                                    </td>

                                    <td>{submission.status}</td>

                                    <td>
                                        {submission.submittedAt
                                            ? new Date(
                                                submission.submittedAt
                                            ).toLocaleString()
                                            : "-"}
                                    </td>

                                    <td>
                                        <div className="submission-actions">

                                            <button
                                                type="button"
                                                className="view-answer-tours"
                                                onClick={() =>
                                                    router.push(
                                                        `/forms/${submission.formId}/submissions/${submission.id}`
                                                    )
                                                }
                                            >
                                                <i className="bi bi-eye"></i>
                                                View Answers
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    deleteSubmission(submission.id)
                                                }
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

            {/* EXPORT COLUMN SELECTION MODAL */}

            {showExportModal && (
                <div
                    className="export-modal-overlay"
                    onClick={() => setShowExportModal(false)}
                >
                    <div
                        className="export-modal"
                        onClick={(event) => event.stopPropagation()}
                    >

                        <div className="export-modal-header">
                            <div>
                                <h2>
                                    <i className="bi bi-file-earmark-spreadsheet"></i>
                                    Export Submissions
                                </h2>

                                <p>
                                    Select the columns you want to include in
                                    your export file.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="export-modal-close"
                                onClick={() => setShowExportModal(false)}
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <div className="export-selection-info">
                            <span>
                                <strong>{selectedColumns.length}</strong> of{" "}
                                {exportColumns.length} columns selected
                            </span>

                            <div>
                                <button
                                    type="button"
                                    onClick={selectAllColumns}
                                >
                                    Select All
                                </button>

                                <button
                                    type="button"
                                    onClick={clearAllColumns}
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>

                        <div className="export-column-list">

                            {exportColumns.map((column) => (
                                <label
                                    key={column.key}
                                    className={`export-column-item ${
                                        selectedColumns.includes(column.key)
                                            ? "selected"
                                            : ""
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedColumns.includes(
                                            column.key
                                        )}
                                        onChange={() =>
                                            toggleColumn(column.key)
                                        }
                                    />

                                    <span className="export-custom-checkbox">
                                        <i className="bi bi-check"></i>
                                    </span>

                                    <span>{column.label}</span>
                                </label>
                            ))}

                        </div>

                        <div className="export-modal-footer">

                            <button
                                type="button"
                                className="export-cancel-btn"
                                onClick={() => setShowExportModal(false)}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="export-download-btn"
                                onClick={exportCSV}
                                disabled={selectedColumns.length === 0}
                            >
                                <i className="bi bi-download"></i>
                                Export CSV
                            </button>

                        </div>

                    </div>
                </div>
            )}

        </main>
    );
}
