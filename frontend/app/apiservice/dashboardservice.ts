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

export const dashboardService = {

    getDashboardDetails: async (): Promise<DashboardResponse> => {
        return await api.get<DashboardResponse>(
            "/api/dashboard/get-details"
        );
    },

};

export default dashboardService;