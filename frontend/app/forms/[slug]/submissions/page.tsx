
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import "./forms-submissions.css";

import formBuilderService, {
    FormResponseDto,
    SubmissionResponseDto
} from "@/app/apiservice/formsservice";

export default function FormSubmissions() {
    const params = useParams();
    const router = useRouter();

    const slug = String(params.slug);

    const [form, setForm] = useState<FormResponseDto | null>(null);
    const [submissions, setSubmissions] = useState<SubmissionResponseDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;

        const loadSubmissions = async () => {
            try {
                setLoading(true);

                const formData = await formBuilderService.forms.getBySlug({
                    slug
                });

                setForm(formData);

                const data = await formBuilderService.submissions.getByForm({
                    id: formData.id
                });

                setSubmissions(data);

            } catch (error) {
                console.error(error);
                alert("Unable to load submissions.");
            } finally {
                setLoading(false);
            }
        };

        loadSubmissions();
    }, [slug]);

    const deleteSubmission = async (id: number) => {
        if (!window.confirm("Delete this submission and its answers?")) return;

        try {
            await formBuilderService.submissions.delete({ id });

            setSubmissions((previous) =>
                previous.filter((item) => item.id !== id)
            );
        } catch (error) {
            console.error(error);
            alert("Unable to delete submission.");
        }
    };

    return (
        <main className="submissions-page">
            <header className="submissions-header">
                <div>
                    <h1>Form Submissions</h1>
                    <p>
                        {form?.formTitle || "View all responses received for this form."}
                    </p>
                </div>

                <button
                    onClick={() => router.push(`/forms/${slug}/builder`)}
                >
                    Back to Builder
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
                                <th>Respondent</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Status</th>
                                <th>Submitted At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {submissions.map((submission, index) => (
                                <tr key={submission.id}>
                                    <td>{index + 1}</td>
                                    <td>{submission.respondentName || "Anonymous"}</td>
                                    <td>{submission.respondentEmail || "-"}</td>
                                    <td>{submission.respondentPhone || "-"}</td>
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
                                            <Link
                                                href={`/forms/${slug}/submissions/${submission.id}`}
                                            >
                                                View Answers
                                            </Link>

                                            <button
                                                onClick={() =>
                                                    deleteSubmission(submission.id)
                                                }
                                            >
                                                Delete
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
