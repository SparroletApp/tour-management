import api from "./apiservice";

export type Id = number | string;

export function crud<T>(base: string) {
    return {
        getAll: () => api.get<T[]>(base),
        getById: (id: Id) => api.get<T>(`${base}/${id}`),
        create: (data: T) => api.post<T>(base, data),
        update: (id: Id, data: T) => api.put<T>(`${base}/${id}`, data),
        delete: (id: Id) => api.delete(`${base}/${id}`),
    };
}

export function childCrud<T>(base: string, parentPath: string) {
    return {
        ...crud<T>(base),
        getByParent: (parentId: Id) => api.get<T[]>(`${base}/${parentPath}/${parentId}`),
    };
}
