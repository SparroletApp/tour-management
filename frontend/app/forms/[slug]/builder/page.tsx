
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import "./form-builder.css";

import formBuilderService, {
    FieldType,
    FormResponseDto,
    QuestionResponseDto,
    SectionResponseDto,
    UpdateQuestionDto,
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

const CHOICE_TYPES: FieldType[] = [
    "DROPDOWN",
    "RADIO",
    "CHECKBOX",
];

const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
});

const showSuccess = (message: string) => {
    Toast.fire({ icon: "success", title: message });
};

const showError = (message: string) => {
    Toast.fire({ icon: "error", title: message });
};

const showWarning = (message: string) => {
    Toast.fire({ icon: "warning", title: message });
};

const showConfirm = async (
    title: string,
    message: string,
    confirmText = "Yes, Continue"
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

interface QuestionDraft {
    questionTitle: string;
    fieldType: FieldType;
    required: boolean;
    placeholder: string;
    helpText: string;
    options: string;
}

const emptyQuestion: QuestionDraft = {
    questionTitle: "",
    fieldType: "TEXT",
    required: false,
    placeholder: "",
    helpText: "",
    options: "",
};

const getOptionsText = (options?: string) => {
    if (!options) return "";

    try {
        const parsed = JSON.parse(options);

        if (Array.isArray(parsed)) {
            return parsed.join("\n");
        }

        return options;
    } catch {
        return options;
    }
};

const parseOptions = (value: string) => {
    return value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
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

    const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(
        null
    );

    const [editingQuestionId, setEditingQuestionId] = useState<number | null>(
        null
    );

    const [editDraft, setEditDraft] = useState<QuestionDraft>({
        ...emptyQuestion,
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const loadBuilder = async () => {
        try {
            setLoading(true);

            const formData = await formBuilderService.forms.getBySlug({
                slug,
            });

            setForm(formData);

            const sectionData =
                await formBuilderService.sections.getByForm({
                    id: formData.id,
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
                setActiveSection((current) => {
                    if (
                        current &&
                        sectionData.some((section) => section.id === current)
                    ) {
                        return current;
                    }

                    return sectionData[0].id;
                });
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

        if (CHOICE_TYPES.includes(fieldType)) {
            const optionList = parseOptions(options);

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
    const toggleQuestion = (questionId: number) => {
        setExpandedQuestionId((previous) =>
            previous === questionId ? null : questionId
        );

        if (editingQuestionId !== questionId) {
            setEditingQuestionId(null);
        }
    };

    const startEditingQuestion = (question: QuestionResponseDto) => {
        setExpandedQuestionId(question.id);
        setEditingQuestionId(question.id);

        setEditDraft({
            questionTitle: question.questionTitle,
            fieldType: question.fieldType,
            required: question.required,
            placeholder: question.placeholder || "",
            helpText: question.helpText || "",
            options: getOptionsText(question.options),
        });
    };

    const updateEditDraft = (
        field: keyof QuestionDraft,
        value: string | boolean
    ) => {
        setEditDraft((previous) => ({
            ...previous,
            [field]: value,
        }));
    };
    const cancelEditing = () => {
        setEditingQuestionId(null);
        setEditDraft({ ...emptyQuestion });
    };

    const saveQuestion = async (
        event: FormEvent,
        questionId: number
    ) => {
        event.preventDefault();

        if (!editDraft.questionTitle.trim()) {
            showWarning("Enter a question title.");
            return;
        }

        let parsedOptions: string | undefined;

        if (CHOICE_TYPES.includes(editDraft.fieldType)) {
            const optionList = parseOptions(editDraft.options);

            if (optionList.length === 0) {
                showWarning("Enter at least one option.");
                return;
            }

            parsedOptions = JSON.stringify(optionList);
        }

        const dto: UpdateQuestionDto = {
            id: questionId,
            questionTitle: editDraft.questionTitle.trim(),
            fieldType: editDraft.fieldType,
            required: editDraft.required,
            placeholder: editDraft.placeholder.trim(),
            helpText: editDraft.helpText.trim(),
            options: parsedOptions,
        };

        try {
            setSaving(true);

            const updatedQuestion =
                await formBuilderService.questions.update(dto);

            if (activeSection) {
                setQuestions((previous) => ({
                    ...previous,
                    [activeSection]: (
                        previous[activeSection] || []
                    ).map((question) =>
                        question.id === questionId
                            ? updatedQuestion
                            : question
                    ),
                }));
            }

            setEditingQuestionId(null);
            setEditDraft({ ...emptyQuestion });

            showSuccess("Question updated successfully.");
        } catch (error) {
            console.error("Update question error:", error);
            showError("Unable to update question.");
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
                ).filter((question) => question.id !== questionId),
            }));

            if (expandedQuestionId === questionId) {
                setExpandedQuestionId(null);
            }

            if (editingQuestionId === questionId) {
                cancelEditing();
            }

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

    const isClosed = form.status === "CLOSED";

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

                    <button onClick={() => router.back()}>
                        <i className="bi bi-arrow-left"></i>
                        Back to Forms
                    </button>

                    <button
                        onClick={() =>
                            router.push(
                                `/forms/${encodeURIComponent(slug)}/submissions`
                            )
                        }
                    >
                        <i className="bi bi-eye"></i>
                        View Responses
                    </button>

                    {form.status === "DRAFT" && (
                        <button onClick={publishForm}>
                            <i className="bi bi-send"></i>
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
                                onClick={() => {
                                    setActiveSection(section.id);
                                    setExpandedQuestionId(null);
                                    cancelEditing();
                                }}
                            >
                                {section.sectionTitle}
                            </button>

                            {!isClosed && (
                                <button
                                    type="button"
                                    onClick={() => deleteSection(section.id)}
                                    aria-label="Delete section"
                                >
                                    <i className="bi bi-trash"></i>
                                </button>
                            )}
                        </div>
                    ))}

                    {!isClosed && (
                        <form
                            onSubmit={addSection}
                            className="builder-add-section"
                        >
                            <h4>Add Section</h4>

                            <input
                                value={sectionTitle}
                                onChange={(e) =>
                                    setSectionTitle(e.target.value)
                                }
                                placeholder="Section title"
                            />

                            <textarea
                                value={sectionDescription}
                                onChange={(e) =>
                                    setSectionDescription(e.target.value)
                                }
                                placeholder="Section description"
                                rows={2}
                            />

                            <button type="submit" disabled={saving}>
                                {saving ? "Adding..." : "Add Section"}
                            </button>
                        </form>
                    )}

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
                                    {questions[activeSection]?.length || 0}
                                    {" "}questions
                                </span>

                            </div>
                            <div className="builder-question-list">

                                {(questions[activeSection] || []).map(
                                    (question, index) => {

                                        const isExpanded =
                                            expandedQuestionId === question.id;

                                        const isEditing =
                                            editingQuestionId === question.id;

                                        const questionOptions =
                                            getOptionsText(question.options)
                                                .split("\n")
                                                .filter(Boolean);

                                        return (
                                            <article
                                                key={question.id}
                                                className={`builder-question-card ${
                                                    isExpanded ? "expanded" : ""
                                                }`}
                                                onClick={() =>
                                                    toggleQuestion(question.id)
                                                }
                                            >
                                                <div className="question-card-header">

                                                    <div className="question-card-info">

                                                        <div className="question-number">
                                                            {index + 1}
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                {question.questionTitle}
                                                            </strong>

                                                            <div className="question-meta">

                                                                <span className="question-type">
                                                                    {question.fieldType}
                                                                </span>

                                                                <span
                                                                    className={
                                                                        question.required
                                                                            ? "required-badge"
                                                                            : "optional-badge"
                                                                    }
                                                                >
                                                                    {question.required
                                                                        ? "Required"
                                                                        : "Optional"}
                                                                </span>

                                                            </div>
                                                        </div>

                                                    </div>

                                                    {/* <div className="question-card-actions">

                                                        <span className="expand-icon">
                                                            <i
                                                                className={`bi ${
                                                                    isExpanded
                                                                        ? "bi-chevron-up"
                                                                        : "bi-chevron-down"
                                                                }`}
                                                            ></i>
                                                        </span>

                                                    </div> */}

                                                </div>
                                                {isExpanded && (

                                                    <div
                                                        className="question-expanded-content"
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                    >

                                                        {!isEditing ? (

                                                            <>

                                                                <div className="question-detail-grid">

                                                                    <div>
                                                                        <label>Question Title</label>
                                                                        <p>{question.questionTitle}</p>
                                                                    </div>

                                                                    <div>
                                                                        <label>Answer Type</label>
                                                                        <p>{question.fieldType}</p>
                                                                    </div>

                                                                    <div>
                                                                        <label>Placeholder</label>
                                                                        <p>
                                                                            {question.placeholder || "Not specified"}
                                                                        </p>
                                                                    </div>

                                                                    <div>
                                                                        <label>Help Text</label>
                                                                        <p>
                                                                            {question.helpText || "Not specified"}
                                                                        </p>
                                                                    </div>

                                                                </div>

                                                                {CHOICE_TYPES.includes(
                                                                    question.fieldType
                                                                ) && (

                                                                    <div className="question-options-preview">

                                                                        <label>Answer Options</label>

                                                                        <div className="question-option-list">

                                                                            {questionOptions.map(
                                                                                (option, optionIndex) => (
                                                                                    <div
                                                                                        key={optionIndex}
                                                                                        className="question-option-item"
                                                                                    >
                                                                                        <span>
                                                                                            {question.fieldType === "RADIO" && (
                                                                                                <i className="bi bi-circle"></i>
                                                                                            )}

                                                                                            {question.fieldType === "CHECKBOX" && (
                                                                                                <i className="bi bi-square"></i>
                                                                                            )}

                                                                                            {question.fieldType === "DROPDOWN" && (
                                                                                                <i className="bi bi-list-ul"></i>
                                                                                            )}
                                                                                        </span>

                                                                                        {option}
                                                                                    </div>
                                                                                )
                                                                            )}

                                                                        </div>

                                                                    </div>
                                                                )}

                                                                <div className="question-expanded-actions">

                                                                    {!isClosed && (
                                                                        <>
                                                                            <button
                                                                                type="button"
                                                                                className="question-edit-btn"
                                                                                onClick={() =>
                                                                                    startEditingQuestion(question)
                                                                                }
                                                                            >
                                                                                <i className="bi bi-pencil-square"></i>
                                                                                Edit Question
                                                                            </button>

                                                                            <button
                                                                                type="button"
                                                                                className="question-delete-btn"
                                                                                onClick={() =>
                                                                                    deleteQuestion(question.id)
                                                                                }
                                                                            >
                                                                                <i className="bi bi-trash"></i>
                                                                                Delete
                                                                            </button>
                                                                        </>
                                                                    )}

                                                                </div>

                                                            </>

                                                        ) : (
                                                            <form
                                                                className="question-edit-form"
                                                                onSubmit={(e) =>
                                                                    saveQuestion(
                                                                        e,
                                                                        question.id
                                                                    )
                                                                }
                                                            >

                                                                <div className="question-edit-heading">
                                                                    <h3>
                                                                        <i className="bi bi-pencil-square"></i>
                                                                        Edit Question
                                                                    </h3>
                                                                    <span>Update question details</span>
                                                                </div>

                                                                <div className="form-field">

                                                                    <label>Question Title *</label>

                                                                    <input
                                                                        value={editDraft.questionTitle}
                                                                        onChange={(e) =>
                                                                            updateEditDraft(
                                                                                "questionTitle",
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                        placeholder="Enter your question"
                                                                        required
                                                                    />

                                                                </div>

                                                                <div className="form-field">

                                                                    <label>Answer Type *</label>

                                                                    <select
                                                                        value={editDraft.fieldType}
                                                                        onChange={(e) =>
                                                                            updateEditDraft(
                                                                                "fieldType",
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
                                                                        value={editDraft.placeholder}
                                                                        onChange={(e) =>
                                                                            updateEditDraft(
                                                                                "placeholder",
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                        placeholder="Enter placeholder"
                                                                    />

                                                                </div>

                                                                <div className="form-field">

                                                                    <label>Help Text</label>

                                                                    <input
                                                                        value={editDraft.helpText}
                                                                        onChange={(e) =>
                                                                            updateEditDraft(
                                                                                "helpText",
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                        placeholder="Enter help text"
                                                                    />

                                                                </div>

                                                                {CHOICE_TYPES.includes(
                                                                    editDraft.fieldType
                                                                ) && (

                                                                    <div className="form-field">

                                                                        <label>
                                                                            Answer Options *
                                                                        </label>

                                                                        <textarea
                                                                            rows={5}
                                                                            value={editDraft.options}
                                                                            onChange={(e) =>
                                                                                updateEditDraft(
                                                                                    "options",
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                            placeholder={"Option 1\nOption 2\nOption 3"}
                                                                        />

                                                                        <small>
                                                                            Enter one option per line.
                                                                        </small>

                                                                    </div>
                                                                )}

                                                                <label className="builder-required">

                                                                    <input
                                                                        type="checkbox"
                                                                        checked={editDraft.required}
                                                                        onChange={(e) =>
                                                                            updateEditDraft(
                                                                                "required",
                                                                                e.target.checked
                                                                            )
                                                                        }
                                                                    />

                                                                    Required question

                                                                </label>

                                                                <div className="question-edit-actions">

                                                                    <button
                                                                        type="button"
                                                                        className="question-cancel-btn"
                                                                        onClick={cancelEditing}
                                                                    >
                                                                        Cancel
                                                                    </button>

                                                                    <button
                                                                        type="submit"
                                                                        className="question-save-btn"
                                                                        disabled={saving}
                                                                    >
                                                                        <i className="bi bi-check-lg"></i>

                                                                        {saving
                                                                            ? "Saving..."
                                                                            : "Save Changes"}
                                                                    </button>

                                                                </div>

                                                            </form>

                                                        )}

                                                    </div>

                                                )}

                                            </article>
                                        );
                                    }
                                )}

                            </div>
                            {!isClosed && (
                                <form
                                    onSubmit={addQuestion}
                                    className="builder-question-form"
                                >

                                    <h3>
                                        <i className="bi bi-plus-circle"></i>
                                        Add Question
                                    </h3>

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
                                                <option value={type} key={type}>
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

                                    {CHOICE_TYPES.includes(fieldType) && (

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
                                                placeholder={"Option 1\nOption 2\nOption 3"}
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

                                    <button type="submit" disabled={saving}>
                                        {saving
                                            ? "Adding..."
                                            : "Add Question"}
                                    </button>

                                </form>
                            )}

                            {isClosed && (
                                <div className="builder-closed-message">
                                    <i className="bi bi-lock-fill"></i>
                                    This form is closed. Questions cannot be added or edited.
                                </div>
                            )}

                        </>
                    )}

                </section>

            </div>

        </main>
    );
}
