import api from "./apiservice";

export interface CompanyCreateDto {
    companyName: string;
}

export interface CompanyIdDto {
    id: number;
}

export interface CompanyResponseDto {
    id: number;
    companyName: string;
    createdAt?: string;
    updatedAt?: string;
}

const companyService = {
    create: (data: CompanyCreateDto): Promise<CompanyResponseDto> => {
        return api.post("/api/companies/create", data);
    },

    getTotalCompanies: async (): Promise<number> => {
    return await api.post("/api/companies/count", {});
},

    getAll: (): Promise<CompanyResponseDto[]> => {
        return api.get("/api/companies/get-all");
    },

    getById: (id: number): Promise<CompanyResponseDto> => {
        return api.post("/api/companies/get-by-id", { id });
    },

    update: (data: CompanyResponseDto): Promise<CompanyResponseDto> => {
        return api.put("/api/companies/update", data);
    },

    delete: (id: number): Promise<void> => {
        return api.delete("/api/companies/delete", { id });
    },
};

export default companyService;