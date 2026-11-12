
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import "./form-builder.css";

import formBuilderService, {
    FieldType,
    FormResponseDto,
    QuestionResponseDto,
    SectionResponseDto,
} from "@/app/apiservice/formsservice";

import Swal from "sweetalert2";

const FIELD_TYPES: FieldType[] = [
    "TEXT",
    "TEXTAREA",
    "NUMBER",
    "EMAIL",
    "PHONE",
    "DATE",
    "DROPDOWN",
    "RADIO",
    "CHECKBOX",
    "FILE",
];

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

const showSuccess = (message: string) => {
    Toast.fire({
        icon: "success",
        title: message,
    });
};

const showError = (message: string) => {
    Toast.fire({
        icon: "error",
        title: message,
    });
};

const showWarning = (message: string) => {
    Toast.fire({
        icon: "warning",
        title: message,
    });
};

const showConfirm = async (
    title: string,
    message: string,
    confirmText: string = "Yes, Continue"
) => {
    const result = await Swal.fire({
        title,
        text: message,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: "Cancel",
        confirmButtonColor: "#064e45",
        cancelButtonColor: "#6c757d",
        reverseButtons: true,
    });

    return result.isConfirmed;
};

export default function FormBuilder() {
    const params = useParams();
    const router = useRouter();

    const slug = params.slug as string;

    const [form, setForm] = useState<FormResponseDto | null>(null);
    const [sections, setSections] = useState<SectionResponseDto[]>([]);
    const [questions, setQuestions] = useState<
        Record<number, QuestionResponseDto[]>
    >({});

    const [sectionTitle, setSectionTitle] = useState("");
    const [sectionDescription, setSectionDescription] = useState("");
    const [activeSection, setActiveSection] = useState<number | null>(null);

    const [questionTitle, setQuestionTitle] = useState("");
    const [fieldType, setFieldType] = useState<FieldType>("TEXT");
    const [required, setRequired] = useState(false);
    const [placeholder, setPlaceholder] = useState("");
    const [helpText, setHelpText] = useState("");
    const [options, setOptions] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadBuilder = async () => {
        try {
            setLoading(true);

            const formData = await formBuilderService.forms.getBySlug({
                slug,
            });

            setForm(formData);

            const formId = formData.id;

            const sectionData =
                await formBuilderService.sections.getByForm({
                    id: formId,
                });

            setSections(sectionData);

            const questionResults = await Promise.all(
                sectionData.map(async (section) => ({
                    sectionId: section.id,
                    data: await formBuilderService.questions.getBySection({
                        id: section.id,
                    }),
                }))
            );

            const questionMap: Record<number, QuestionResponseDto[]> = {};

            questionResults.forEach((item) => {
                questionMap[item.sectionId] = item.data;
            });

            setQuestions(questionMap);

            if (sectionData.length > 0) {
                setActiveSection(sectionData[0].id);
            } else {
                setActiveSection(null);
            }
        } catch (error) {
            console.error("Load builder error:", error);
            setForm(null);
            showError("Unable to load form builder.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (slug) {
            loadBuilder();
        }
    }, [slug]);

    const formId = form?.id;

    const addSection = async (event: FormEvent) => {
        event.preventDefault();

        if (!formId) {
            showWarning("Form not found.");
            return;
        }

        if (!sectionTitle.trim()) {
            showWarning("Enter a section title.");
            return;
        }

        try {
            setSaving(true);

            const section = await formBuilderService.sections.create({
                formId,
                sectionTitle: sectionTitle.trim(),
                sectionDescription: sectionDescription.trim(),
                displayOrder: sections.length + 1,
            });

            setSections((previous) => [...previous, section]);

            setQuestions((previous) => ({
                ...previous,
                [section.id]: [],
            }));

            setActiveSection(section.id);
            setSectionTitle("");
            setSectionDescription("");

            showSuccess("Section added successfully.");
        } catch (error) {
            console.error(error);
            showError("Unable to create section.");
        } finally {
            setSaving(false);
        }
    };

    const addQuestion = async (event: FormEvent) => {
        event.preventDefault();

        if (!activeSection) {
            showWarning("Select a section first.");
            return;
        }

        if (!questionTitle.trim()) {
            showWarning("Enter a question.");
            return;
        }

        let parsedOptions: string | undefined;

        if (["DROPDOWN", "RADIO", "CHECKBOX"].includes(fieldType)) {
            const optionList = options
                .split("\n")
                .map((item) => item.trim())
                .filter(Boolean);

            if (optionList.length === 0) {
                showWarning("Enter at least one option.");
                return;
            }

            parsedOptions = JSON.stringify(optionList);
        }

        try {
            setSaving(true);

            const question = await formBuilderService.questions.create({
                sectionId: activeSection,
                questionTitle: questionTitle.trim(),
                fieldType,
                required,
                placeholder,
                helpText,
                options: parsedOptions,
                displayOrder:
                    (questions[activeSection]?.length || 0) + 1,
            });

            setQuestions((previous) => ({
                ...previous,
                [activeSection]: [
                    ...(previous[activeSection] || []),
                    question,
                ],
            }));

            setQuestionTitle("");
            setPlaceholder("");
            setHelpText("");
            setOptions("");
            setRequired(false);
            setFieldType("TEXT");

            showSuccess("Question added successfully.");
        } catch (error) {
            console.error(error);
            showError("Unable to add question.");
        } finally {
            setSaving(false);
        }
    };

    const deleteSection = async (id: number) => {
        const confirmed = await showConfirm(
            "Delete Section?",
            "Delete this section and its questions?",
            "Yes, Delete"
        );

        if (!confirmed) return;

        try {
            await formBuilderService.sections.delete({ id });

            setSections((previous) =>
                previous.filter((section) => section.id !== id)
            );

            setQuestions((previous) => {
                const updated = { ...previous };
                delete updated[id];
                return updated;
            });

            if (activeSection === id) {
                setActiveSection(null);
            }

            showSuccess("Section deleted successfully.");
        } catch (error) {
            console.error(error);
            showError("Unable to delete section.");
        }
    };

    const deleteQuestion = async (questionId: number) => {
        if (!activeSection) return;

        const confirmed = await showConfirm(
            "Delete Question?",
            "Are you sure you want to delete this question?",
            "Yes, Delete"
        );

        if (!confirmed) return;

        try {
            await formBuilderService.questions.delete({
                id: questionId,
            });

            setQuestions((previous) => ({
                ...previous,
                [activeSection]: (
                    previous[activeSection] || []
                ).filter(
                    (question) => question.id !== questionId
                ),
            }));

            showSuccess("Question deleted successfully.");
        } catch (error) {
            console.error(error);
            showError("Unable to delete question.");
        }
    };

    const publishForm = async () => {
        if (!formId) return;

        const confirmed = await showConfirm(
            "Publish Form?",
            "Are you sure you want to publish this form?",
            "Yes, Publish"
        );

        if (!confirmed) return;

        try {
            await formBuilderService.forms.publish({
                id: formId,
            });

            await loadBuilder();

            showSuccess("Form published successfully.");
        } catch (error) {
            console.error(error);
            showError("Unable to publish form.");
        }
    };

    if (loading) {
        return (
            <main className="builder-page">
                Loading builder...
            </main>
        );
    }

    if (!form) {
        return (
            <main className="builder-page">
                Form not found.
            </main>
        );
    }

    return (
        <main className="builder-page">
            <header className="builder-header">
                <div>
                    <h1>{form.formTitle}</h1>

                    <p>{form.formDescription}</p>

                    <span
                        className={`form-status ${form.status.toLowerCase()}`}
                    >
                        {form.status}
                    </span>
                </div>

                <div className="builder-header-actions">
                    <button
                        onClick={() => router.push("/forms")}
                    >
                        Back to Forms
                    </button>

                    <button
                        onClick={() =>
                            router.push(
                                `/forms/${encodeURIComponent(slug)}/submissions`
                            )
                        }
                    >
                        View Responses
                    </button>

                    {form.status === "DRAFT" && (
                        <button onClick={publishForm}>
                            Publish Form
                        </button>
                    )}
                </div>
            </header>

            <div className="builder-layout">
                <aside className="builder-sidebar">
                    <h3>Sections</h3>

                    {sections.map((section) => (
                        <div
                            key={section.id}
                            className={`builder-section-item ${
                                activeSection === section.id
                                    ? "active"
                                    : ""
                            }`}
                        >
                            <button
                                onClick={() =>
                                    setActiveSection(section.id)
                                }
                            >
                                {section.sectionTitle}
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    deleteSection(section.id)
                                }
                                aria-label="Delete section"
                            >
                                ×
                            </button>
                        </div>
                    ))}

                    <form
                        onSubmit={addSection}
                        className="builder-add-section"
                    >
                        <h4>Add Section</h4>

                        <input
                            value={sectionTitle}
                            onChange={(e) => setSectionTitle(e.target.value)}
                            placeholder="Section title"
                            disabled={form.status === "CLOSED"}
                        />

                        <textarea
                            value={sectionDescription}
                            onChange={(e) =>
                                setSectionDescription(e.target.value)
                            }
                            placeholder="Section description"
                            rows={2}
                            disabled={form.status === "CLOSED"}
                        />

                        <button
                            type="submit"
                            disabled={saving || form.status === "CLOSED"}
                        >
                            {form.status === "CLOSED"
                                ? "Form Closed"
                                : saving
                                    ? "Adding..."
                                    : "Add Section"}
                        </button>

                        {form.status === "CLOSED" && (
                            <small className="builder-closed-message">
                                <i className="bi bi-lock-fill"></i>
                                This form is closed. You cannot add sections.
                            </small>
                        )}
                    </form>
                </aside>

                <section className="builder-content">
                    {!activeSection ? (
                        <div className="builder-empty">
                            <h2>Create your first section</h2>
                            <p>
                                Add a section to start adding questions.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="builder-content-header">
                                <h2>
                                    {
                                        sections.find(
                                            (item) =>
                                                item.id === activeSection
                                        )?.sectionTitle
                                    }
                                </h2>

                                <span>
                                    {
                                        questions[activeSection]?.length || 0
                                    }{" "}
                                    questions
                                </span>
                            </div>

                            <div className="builder-question-list">
                                {(questions[activeSection] || []).map(
                                    (question, index) => (
                                        <article
                                            className="builder-question-card"
                                            key={question.id}
                                        >
                                            <div>
                                                <strong>
                                                    {index + 1}.{" "}
                                                    {question.questionTitle}
                                                </strong>

                                                <p>
                                                    {question.fieldType}
                                                    {question.required
                                                        ? " • Required"
                                                        : " • Optional"}
                                                </p>

                                                {question.options && (
                                                    <small>
                                                        {question.options}
                                                    </small>
                                                )}
                                            </div>

                                            <button
                                                onClick={() =>
                                                    deleteQuestion(
                                                        question.id
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>
                                        </article>
                                    )
                                )}
                            </div>

                            <form
                                onSubmit={addQuestion}
                                className="builder-question-form"
                            >
                                <h3>Add Question</h3>

                                <div className="form-field">
                                    <label>Question *</label>

                                    <input
                                        value={questionTitle}
                                        onChange={(e) =>
                                            setQuestionTitle(e.target.value)
                                        }
                                        placeholder="Enter your question"
                                        required
                                    />
                                </div>

                                <div className="form-field">
                                    <label>Answer Type</label>

                                    <select
                                        value={fieldType}
                                        onChange={(e) =>
                                            setFieldType(
                                                e.target.value as FieldType
                                            )
                                        }
                                    >
                                        {FIELD_TYPES.map((type) => (
                                            <option
                                                value={type}
                                                key={type}
                                            >
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-field">
                                    <label>Placeholder</label>

                                    <input
                                        value={placeholder}
                                        onChange={(e) =>
                                            setPlaceholder(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="form-field">
                                    <label>Help Text</label>

                                    <input
                                        value={helpText}
                                        onChange={(e) =>
                                            setHelpText(e.target.value)
                                        }
                                    />
                                </div>

                                {[
                                    "DROPDOWN",
                                    "RADIO",
                                    "CHECKBOX",
                                ].includes(fieldType) && (
                                    <div className="form-field">
                                        <label>
                                            Options (one option per line)
                                        </label>

                                        <textarea
                                            rows={4}
                                            value={options}
                                            onChange={(e) =>
                                                setOptions(e.target.value)
                                            }
                                            placeholder={
                                                "Option 1\nOption 2\nOption 3"
                                            }
                                        />
                                    </div>
                                )}

                                <label className="builder-required">
                                    <input
                                        type="checkbox"
                                        checked={required}
                                        onChange={(e) =>
                                            setRequired(e.target.checked)
                                        }
                                    />
                                    Required question
                                </label>

                                <button
                                    type="submit"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Adding..."
                                        : "Add Question"}
                                </button>
                            </form>
                        </>
                    )}
                </section>
            </div>
        </main>
    );
}
