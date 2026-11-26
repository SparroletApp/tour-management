import api from "./apiservice";

export interface Terms {
    id: number;
    companyId: number;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string | null;
}

export interface TermsCreateDto {
    companyId: number;
    name: string;
    description: string;
}

export interface TermsUpdateDto {
    id: number;
    companyId: number;
    name: string;
    description: string;
}

export const termsService = {
    create: (data: TermsCreateDto) =>
        api.post<Terms>("/api/terms/create", data),

    getAll: () =>
        api.post<Terms[]>("/api/terms/get-all", {}),

    getById: (id: number) =>
        api.post<Terms>("/api/terms/get-by-id", { id }),

    getByCompanyId: (companyId: number) =>
        api.post<Terms[]>("/api/terms/get-by-company-id", {
            companyId,
        }),

    update: (data: TermsUpdateDto) =>
        api.post<Terms>("/api/terms/update", data),

    delete: (id: number) =>
        api.post<{ message: string }>("/api/terms/delete", { id }),
};

export default termsService;