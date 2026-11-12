
import api from "./apiservice";

export interface IdDto {
    id: number;
}

export interface FormTokenDto {
    publicToken: string;
}

export interface FormSlugDto {
    slug: string;
}


export interface CreateFormDto {
    packageId: number;
    formTitle: string;
    formDescription?: string;
    allowMultipleSubmissions?: boolean;
    expiryDate?: string | null;
}

export interface UpdateFormDto {
    id: number;
    packageId: number;
    formTitle: string;
    formDescription?: string;
    allowMultipleSubmissions?: boolean;
    expiryDate?: string | null;
}

export interface FormResponseDto {
    id: number;
    formTitle: string;
    formDescription?: string;
    slug: string;
    publicToken: string;
    status: string;
    allowMultipleSubmissions: boolean;
    expiryDate?: string | null;
    createdAt?: string;
    updatedAt?: string;
    packageId: number;
    tourPackageName?: string;
}


export interface CreateSectionDto {
    formId: number;
    sectionTitle: string;
    sectionDescription?: string;
    displayOrder?: number;
}

export interface UpdateSectionDto {
    id: number;
    sectionTitle?: string;
    sectionDescription?: string;
    displayOrder?: number;
}

export interface SectionResponseDto {
    id: number;
    formId: number;
    sectionTitle: string;
    sectionDescription?: string;
    displayOrder: number;
    createdAt?: string;
    updatedAt?: string;
}

export type FieldType =
    | "TEXT"
    | "TEXTAREA"
    | "NUMBER"
    | "EMAIL"
    | "PHONE"
    | "DATE"
    | "DROPDOWN"
    | "RADIO"
    | "CHECKBOX"
    | "FILE";

export interface CreateQuestionDto {
    sectionId: number;
    questionTitle: string;
    fieldType: FieldType;
    required?: boolean;
    placeholder?: string;
    helpText?: string;
    options?: string;
    displayOrder?: number;
}

export interface UpdateQuestionDto {
    id: number;
    questionTitle?: string;
    fieldType?: FieldType;
    required?: boolean;
    placeholder?: string;
    helpText?: string;
    options?: string;
    displayOrder?: number;
}

export interface QuestionResponseDto {
    id: number;
    sectionId: number;
    questionTitle: string;
    fieldType: FieldType;
    required: boolean;
    placeholder?: string;
    helpText?: string;
    options?: string;
    displayOrder: number;
}


export interface CreateSubmissionDto {
    formId: number;
    respondentName?: string;
    respondentEmail?: string;
    respondentPhone?: string;
}

export interface SubmissionResponseDto {
    id: number;
    formId: number;
    formTitle: string;
    respondentName?: string;
    respondentEmail?: string;
    respondentPhone?: string;
    status: string;
    submittedAt?: string;
    createdAt?: string;
}


export interface CreateAnswerDto {
    questionId: number;
    answer?: string;
}

export interface SubmitAnswersDto {
    submissionId: number;
    answers: CreateAnswerDto[];
}

export interface AnswerResponseDto {
    id: number;
    submissionId: number;
    questionId: number;
    questionTitle: string;
    answer?: string;
}



export const formsService = {

    create: (dto: CreateFormDto) =>
        api.post<FormResponseDto>(
            "/api/forms/create",
            dto
        ),

    getAll: () =>
        api.post<FormResponseDto[]>(
            "/api/forms/get-all",
            {}
        ),

    getByToken: (dto: FormTokenDto) =>
        api.post<FormResponseDto>(
            "/api/forms/get-by-token",
            dto
        ),

    getById: (dto: IdDto) =>
        api.post<FormResponseDto>(
            "/api/forms/get-by-id",
            dto
        ),

    getBySlug: (dto: FormSlugDto) =>
        api.post<FormResponseDto>(
            "/api/forms/get-by-slug",
            dto
        ),

    update: (dto: UpdateFormDto) =>
        api.post<FormResponseDto>(
            "/api/forms/update",
            dto
        ),

    delete: (dto: IdDto) =>
        api.post<string>(
            "/api/forms/delete",
            dto
        ),

    publish: (dto: IdDto) =>
        api.post<FormResponseDto>(
            "/api/forms/publish",
            dto
        ),

    close: (dto: IdDto) =>
        api.post<FormResponseDto>(
            "/api/forms/close",
            dto
        ),
};

export const formSectionService = {

    create: (dto: CreateSectionDto) =>
        api.post<SectionResponseDto>(
            "/api/form-sections/create",
            dto
        ),

    getByForm: (dto: IdDto) =>
        api.post<SectionResponseDto[]>(
            "/api/form-sections/get-by-form",
            dto
        ),

    getById: (dto: IdDto) =>
        api.post<SectionResponseDto>(
            "/api/form-sections/get-by-id",
            dto
        ),

    update: (dto: UpdateSectionDto) =>
        api.post<SectionResponseDto>(
            "/api/form-sections/update",
            dto
        ),

    delete: (dto: IdDto) =>
        api.post<string>(
            "/api/form-sections/delete",
            dto
        ),
};

export const formQuestionService = {

    create: (dto: CreateQuestionDto) =>
        api.post<QuestionResponseDto>(
            "/api/questions/create",
            dto
        ),

    getBySection: (dto: IdDto) =>
        api.post<QuestionResponseDto[]>(
            "/api/questions/get-by-section",
            dto
        ),

    getById: (dto: IdDto) =>
        api.post<QuestionResponseDto>(
            "/api/questions/get-by-id",
            dto
        ),

    update: (dto: UpdateQuestionDto) =>
        api.post<QuestionResponseDto>(
            "/api/questions/update",
            dto
        ),

    delete: (dto: IdDto) =>
        api.post<string>(
            "/api/questions/delete",
            dto
        ),
};

export const formSubmissionService = {

    create: (dto: CreateSubmissionDto) =>
        api.post<SubmissionResponseDto>(
            "/api/form-submissions/create",
            dto
        ),

    getByForm: (dto: IdDto) =>
        api.post<SubmissionResponseDto[]>(
            "/api/form-submissions/get-by-form",
            dto
        ),

    getById: (dto: IdDto) =>
        api.post<SubmissionResponseDto>(
            "/api/form-submissions/get-by-id",
            dto
        ),

    delete: (dto: IdDto) =>
        api.post<string>(
            "/api/form-submissions/delete",
            dto
        ),
};

export const formAnswerService = {

    submit: (dto: SubmitAnswersDto) =>
        api.post<AnswerResponseDto[]>(
            "/api/answers/submit",
            dto
        ),

    getBySubmission: (dto: IdDto) =>
        api.post<AnswerResponseDto[]>(
            "/api/answers/get-by-submission",
            dto
        ),

    getById: (dto: IdDto) =>
        api.post<AnswerResponseDto>(
            "/api/answers/get-by-id",
            dto
        ),

    delete: (dto: IdDto) =>
        api.post<string>(
            "/api/answers/delete",
            dto
        ),
};


const formBuilderService = {
    forms: formsService,
    sections: formSectionService,
    questions: formQuestionService,
    submissions: formSubmissionService,
    answers: formAnswerService,
};

export default formBuilderService;
