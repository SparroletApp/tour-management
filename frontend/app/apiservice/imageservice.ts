import api from "./apiservice";

export interface OnlineImage {
    id: number;
    thumb: string;
    full: string;
    credit: string;
    link: string;
}

export const searchImages = async (q: string, page = 1): Promise<OnlineImage[]> => {
    const res = await api.get<{ images: OnlineImage[] }>("/api/images/search", {
        params: { q, page },
    });
    return res.images ?? [];
};

export const importImage = async (url: string): Promise<string> => {
    const res = await api.post<{ url: string }>("/api/images/import", { url });
    return res.url;
};