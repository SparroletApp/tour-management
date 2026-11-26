
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./forms-submissions.css";

import formBuilderService, {
    SubmissionResponseDto
} from "@/app/apiservice/formsservice";
import Swal from "sweetalert2";

export default function FormSubmissions() {
    const router = useRouter();

    const [submissions, setSubmissions] = useState<SubmissionResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [packageId, setPackageId] = useState<number | null>(null);


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

        if (!result.isConfirmed) {
            return;
        }

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

                <button
                    type="button"
                    onClick={() => router.push("/tours")}
                >
                    Back to Tours
                </button>
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

        </main>
    );
}
