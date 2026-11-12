
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import "./tour-form.css";
import formBuilderService, { FieldType, FormResponseDto, QuestionResponseDto, SectionResponseDto } from "../../apiservice/formsservice";
import { tourPackageService } from "../../apiservice/tourservice";
import { setSelectedTourId } from "../../utils/tourStorage";

interface FormFieldAnswer {
    questionId: number;
    answer: string;
}

export default function PublicFormPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [formCoverImage, setFormCoverImage] = useState("");
    const [tourCode, setTourCode] = useState("");

    const API_BASE =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

    const imageUrl = (url?: string | null) => {
        if (!url) return "";
        if (/^(https?:\/\/|data:)/i.test(url)) return url;

        return `${API_BASE.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
    };

    const [form, setForm] = useState<FormResponseDto | null>(null);
    const [sections, setSections] = useState<SectionResponseDto[]>([]);
    const [questions, setQuestions] = useState<Record<number, QuestionResponseDto[]>>({});
    const [respondentName, setRespondentName] = useState("");
    const [respondentEmail, setRespondentEmail] = useState("");
    const [respondentPhone, setRespondentPhone] = useState("");
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (slug) {
            loadPublicForm();
        }
    }, [slug]);

    const loadPublicForm = async () => {
        try {
            setLoading(true);
            setError("");

            const formData = await formBuilderService.forms.getBySlug({
                slug,
            });
            setForm(formData);

            // Keep the related tour package ID for the Tour Details page.
            const packageId = (
                formData as FormResponseDto & { packageId?: number }
            ).packageId;

            if (packageId) {
                setSelectedTourId(packageId);

                // Load the tour cover and code without blocking the public form
                // if the tour details request fails.
                try {
                    const tourResponse = await tourPackageService.getFull(
                        String(packageId)
                    );

                    const packageData = tourResponse?.tourPackage;

                    if (packageData) {
                        setFormCoverImage(
                            imageUrl(packageData.coverImageUrl)
                        );
                        setTourCode(packageData.tourCode || "");
                    }
                } catch (tourError) {
                    console.error("Unable to load tour package:", tourError);
                }
            }

            if (formData.status !== "PUBLISHED") {
                setError("This form is not available.");
                return;
            }

            if (formData.expiryDate && new Date(formData.expiryDate) < new Date()) {
                setError("This form has expired.");
                return;
            }

            const sectionData = await formBuilderService.sections.getByForm({
                id: formData.id,
            });

            setSections(sectionData);

            const questionMap: Record<number, QuestionResponseDto[]> = {};

            for (const section of sectionData) {
                const questionData =
                    await formBuilderService.questions.getBySection({
                        id: section.id,
                    });

                questionMap[section.id] = questionData;
            }

            setQuestions(questionMap);
        } catch (err: any) {
            console.error(err);
            setError(
                err?.response?.data?.message ||
                "Unable to load this form. The link may be invalid."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId: number, value: string) => {
        setAnswers((previous) => ({
            ...previous,
            [questionId]: value,
        }));
    };

    const getOptions = (options?: string): string[] => {
        if (!options) return [];

        try {
            const parsed = JSON.parse(options);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return options.split("\n").map((item) => item.trim()).filter(Boolean);
        }
    };

    const renderQuestion = (question: QuestionResponseDto) => {
        const value = answers[question.id] || "";
        const options = getOptions(question.options);

        switch (question.fieldType as FieldType) {
            case "TEXT":
            case "EMAIL":
            case "PHONE":
            case "NUMBER":
            case "DATE":
                return (
                    <input
                        type={
                            question.fieldType === "NUMBER"
                                ? "number"
                                : question.fieldType === "DATE"
                                    ? "date"
                                    : question.fieldType === "EMAIL"
                                        ? "email"
                                        : question.fieldType === "PHONE"
                                            ? "tel"
                                            : "text"
                        }
                        className="public-input"
                        placeholder={question.placeholder || ""}
                        required={question.required}
                        value={value}
                        onChange={(e) =>
                            handleAnswerChange(question.id, e.target.value)
                        }
                    />
                );

            case "TEXTAREA":
                return (
                    <textarea
                        className="public-input public-textarea"
                        placeholder={question.placeholder || ""}
                        required={question.required}
                        value={value}
                        onChange={(e) =>
                            handleAnswerChange(question.id, e.target.value)
                        }
                    />
                );

            case "DROPDOWN":
                return (
                    <select
                        className="public-input"
                        required={question.required}
                        value={value}
                        onChange={(e) =>
                            handleAnswerChange(question.id, e.target.value)
                        }
                    >
                        <option value="">Select an option</option>
                        {options.map((option, index) => (
                            <option key={index} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                );

            case "RADIO":
                return (
                    <div className="public-options">
                        {options.map((option, index) => (
                            <label key={index} className="public-option">
                                <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    value={option}
                                    checked={value === option}
                                    required={question.required && !value}
                                    onChange={(e) =>
                                        handleAnswerChange(question.id, e.target.value)
                                    }
                                />
                                <span>{option}</span>
                            </label>
                        ))}
                    </div>
                );

            case "CHECKBOX":
                return (
                    <div className="public-options">
                        {options.map((option, index) => {
                            const selected = value
                                ? value.split(",").filter(Boolean)
                                : [];

                            return (
                                <label key={index} className="public-option">
                                    <input
                                        type="checkbox"
                                        value={option}
                                        checked={selected.includes(option)}
                                        onChange={(e) => {
                                            const updated = e.target.checked
                                                ? [...selected, option]
                                                : selected.filter((item) => item !== option);

                                            handleAnswerChange(
                                                question.id,
                                                updated.join(",")
                                            );
                                        }}
                                    />
                                    <span>{option}</span>
                                </label>
                            );
                        })}
                        {question.required && !value && (
                            <small className="public-help">
                                Select at least one option.
                            </small>
                        )}
                    </div>
                );

            case "FILE":
                return (
                    <input
                        type="file"
                        className="public-input"
                        onChange={(e) =>
                            handleAnswerChange(
                                question.id,
                                e.target.files?.[0]?.name || ""
                            )
                        }
                    />
                );

            default:
                return (
                    <input
                        type="text"
                        className="public-input"
                        value={value}
                        required={question.required}
                        onChange={(e) =>
                            handleAnswerChange(question.id, e.target.value)
                        }
                    />
                );
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!form) return;

        try {
            setSubmitting(true);
            setError("");

            const allQuestions = Object.values(questions).flat();

            const missingQuestion = allQuestions.find(
                (question) =>
                    question.required &&
                    !(answers[question.id] || "").trim()
            );

            if (missingQuestion) {
                setError(`Please answer: ${missingQuestion.questionTitle}`);
                setSubmitting(false);
                return;
            }

            const submission = await formBuilderService.submissions.create({
                formId: form.id,
                respondentName,
                respondentEmail,
                respondentPhone,
            });

            const answerList = allQuestions
                .filter((question) => answers[question.id]?.trim())
                .map((question) => ({
                    questionId: question.id,
                    answer: answers[question.id],
                }));

            if (answerList.length > 0) {
                await formBuilderService.answers.submit({
                    submissionId: submission.id,
                    answers: answerList,
                });
            }

            setSuccess(true);
        } catch (err: any) {
            console.error(err);
            setError(
                err?.response?.data?.message ||
                "Unable to submit your response. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="public-form-page">
                <div className="public-form-card public-loading">
                    Loading form...
                </div>
            </div>
        );
    }

    if (error && !form) {
        return (
            <div className="public-form-page">
                <div className="public-form-card public-error">
                    <h2>Form unavailable</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="public-form-page">
                <div className="public-form-card public-success">
                    <div className="success-icon">
                        <i className="bi bi-check-circle-fill"></i>
                    </div>
                    <h2>Response submitted!</h2>
                    <p>Thank you. Your response has been recorded successfully.</p>

                    <button
                        type="button"
                        className="view-tour-btn"
                        disabled={!((form as FormResponseDto & { packageId?: number })?.packageId) || !tourCode}
                        onClick={() => {
                            const packageId = (
                                form as FormResponseDto & { packageId?: number }
                            )?.packageId;

                            if (!packageId || !tourCode) return;

                            setSelectedTourId(packageId);
                            router.push(
                                `/tour-details/${encodeURIComponent(tourCode)}`
                            );
                        }}
                    >
                        View Tour Details
                        <i className="bi bi-arrow-right"></i>
                    </button>
                </div>
            </div>
        );
    }

    if (!form) return null;

    return (
        <main className="public-form-page">
            <form className="public-form-card" onSubmit={handleSubmit}>
                {formCoverImage && tourCode && (
                    <div className="public-tour-cover-wrapper">
                        <div
                            className="public-tour-cover-clickable"
                            onClick={() => {
                                const packageId = (
                                    form as FormResponseDto & { packageId?: number }
                                )?.packageId;

                                if (!packageId) return;

                                setSelectedTourId(packageId);
                                router.push(
                                    `/tour-details/${encodeURIComponent(tourCode)}`
                                );
                            }}
                        >
                            <img
                                src={formCoverImage}
                                alt="Explore Tour"
                            />

                            <div className="public-tour-cover-overlay">
                                <h2>Explore Tour</h2>
                                <span>
                                    View Tour Details
                                    <i className="bi bi-arrow-right"></i>
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="public-form-header">
                    <h1>{form.formTitle}</h1>
                    {form.formDescription && (
                        <p>{form.formDescription}</p>
                    )}
                </div>

                <div className="public-respondent-section">
                    <h3>Personal Information</h3>

                    <div className="public-field">
                        <label>
                            Name <span>*</span>
                        </label>
                        <input
                            type="text"
                            className="public-input"
                            value={respondentName}
                            required
                            onChange={(e) => setRespondentName(e.target.value)}
                            placeholder="Enter your name"
                        />
                    </div>

                    <div className="public-field">
                        <label>Email</label>
                        <input
                            type="email"
                            className="public-input"
                            value={respondentEmail}
                            onChange={(e) => setRespondentEmail(e.target.value)}
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="public-field">
                        <label>Phone</label>
                        <input
                            type="tel"
                            className="public-input"
                            value={respondentPhone}
                            onChange={(e) => setRespondentPhone(e.target.value)}
                            placeholder="Enter your phone number"
                        />
                    </div>
                </div>

                {sections.map((section) => (
                    <section className="public-section" key={section.id}>
                        <div className="public-section-header">
                            <h2>{section.sectionTitle}</h2>
                            {section.sectionDescription && (
                                <p>{section.sectionDescription}</p>
                            )}
                        </div>

                        {(questions[section.id] || []).map((question) => (
                            <div className="public-field" key={question.id}>
                                <label>
                                    {question.questionTitle}
                                    {question.required && <span> *</span>}
                                </label>

                                {renderQuestion(question)}

                                {question.helpText && (
                                    <small className="public-help">
                                        {question.helpText}
                                    </small>
                                )}
                            </div>
                        ))}
                    </section>
                ))}

                {error && <div className="public-error-message">{error}</div>}

                <button
                    type="submit"
                    className="public-submit-btn"
                    disabled={submitting}
                >
                    {submitting ? "Submitting..." : "Submit Response"}
                </button>

                <p className="public-footer">
                    Powered by Tour Management
                </p>
            </form>
        </main>
    );
}
