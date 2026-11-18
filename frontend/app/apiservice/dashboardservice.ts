import api from "./apiservice";

export interface DashboardResponse {
    totalTourPackages: number;
    publishedTourPackages: number;
    draftTourPackages: number;
    closedTourPackages: number;

    totalForms: number;
    publishedForms: number;
    draftForms: number;
    closedForms: number;
}

export interface CompanyIdDto {
    id: number;
}

export const dashboardService = {

    getDashboardDetails: async (
        data: CompanyIdDto
    ): Promise<DashboardResponse> => {
        return await api.post<DashboardResponse>(
            "/api/dashboard/get-details",
            data
        );
    },

};

export default dashboardService;