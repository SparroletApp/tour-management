
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import formBuilderService, {
    AnswerResponseDto,
    SubmissionResponseDto
} from "@/app/apiservice/formsservice";
import "./submission-detail.css";

export default function SubmissionDetails() {
    const params = useParams();
    const router = useRouter();

    const slug = String(params.slug);
    const submissionId = Number(params.submissionId);

    const [submission, setSubmission] = useState<SubmissionResponseDto | null>(null);
    const [answers, setAnswers] = useState<AnswerResponseDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug || !submissionId || Number.isNaN(submissionId)) {
            setLoading(false);
            return;
        }

        const loadDetails = async () => {
            try {
                setLoading(true);

                const [submissionData, answerData] = await Promise.all([
                    formBuilderService.submissions.getById({
                        id: submissionId
                    }),

                    formBuilderService.answers.getBySubmission({
                        id: submissionId
                    })
                ]);

                setSubmission(submissionData);
                setAnswers(answerData);

            } catch (error) {
                console.error(error);
                alert("Unable to load submission details.");
            } finally {
                setLoading(false);
            }
        };

        loadDetails();
    }, [slug, submissionId]);

    if (loading) {
        return (
            <main className="submission-detail-page">
                Loading...
            </main>
        );
    }

    if (!submission) {
        return (
            <main className="submission-detail-page">
                Submission not found.
            </main>
        );
    }

    return (
        <main className="submission-detail-page">
            <header className="submission-detail-header">
                <div>
                    <h1>Submission Details</h1>
                    <p>Response #{submission.id}</p>
                </div>

                <button
                    onClick={() =>
                        router.push(`/forms/${slug}/submissions`)
                    }
                >
                    Back to Submissions
                </button>
            </header>

            <section className="respondent-card">
                <h2>Respondent Information</h2>

                <div className="respondent-grid">
                    <div>
                        <label>Name</label>
                        <p>{submission.respondentName || "Anonymous"}</p>
                    </div>

                    <div>
                        <label>Email</label>
                        <p>{submission.respondentEmail || "-"}</p>
                    </div>

                    <div>
                        <label>Phone</label>
                        <p>{submission.respondentPhone || "-"}</p>
                    </div>

                    <div>
                        <label>Submitted At</label>
                        <p>
                            {submission.submittedAt
                                ? new Date(
                                    submission.submittedAt
                                ).toLocaleString()
                                : "-"}
                        </p>
                    </div>
                </div>
            </section>

            <section className="answers-card">
                <h2>Answers</h2>

                {answers.length === 0 ? (
                    <p>No answers found for this submission.</p>
                ) : (
                    answers.map((answer, index) => (
                        <article
                            className="answer-item"
                            key={answer.id}
                        >
                            <label>Question {index + 1}</label>

                            <h3>{answer.questionTitle}</h3>

                            <p>
                                {answer.answer || "No answer provided"}
                            </p>
                        </article>
                    ))
                )}
            </section>
        </main>
    );
}
