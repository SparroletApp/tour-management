
import api from "./apiservice";

export interface OnlineImage {
    id: string;
    preview: string;
    full: string;
    photographer: string;
    pageUrl: string;
    photographerUrl: string;
    downloadLocation: string;
}

interface ImageSearchResponse {
    images: OnlineImage[];
}

interface ImageImportResponse {
    url: string;
}

export const searchImages = async (
    q: string,
    page = 1
): Promise<OnlineImage[]> => {
    const response = await api.get<ImageSearchResponse>(
        "/api/images/search",
        {
            params: { q, page },
        }
    );

    return response?.images ?? [];
};

export const importImage = async (
    image: OnlineImage
): Promise<string> => {
    const response = await api.post<ImageImportResponse>(
        "/api/images/import",
        {
            url: image.full,
            downloadLocation: image.downloadLocation,
        }
    );

    if (!response?.url) {
        throw new Error("Image import failed. Image URL not returned.");
    }

    return response.url;
};
