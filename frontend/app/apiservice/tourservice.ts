import api from "./apiservice";

import { TourPackage, TourPackageFull } from "../types/tour";
import { crud, Id } from "./crudservice";

export const tourPackageService = {
    ...crud<TourPackage>("/api/tours"),
    getFull: (id: Id) => api.get<TourPackageFull>(`/api/tours/${id}/full`),
    createFull: (data: TourPackageFull) => api.post<TourPackageFull>("/api/tours/full", data),
    updateFull: (id: Id, data: TourPackageFull) =>
        api.put<TourPackageFull>(`/api/tours/${id}/full`, data),
};
