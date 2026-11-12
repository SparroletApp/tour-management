
import api from "./apiservice";

export interface ImageUploadResponse {
    message: string;
    imageUrl: string;
}

export const uploadService = {
    uploadImage: async (file: File): Promise<ImageUploadResponse> => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await api.post<ImageUploadResponse>(
            "/api/uploads/image",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return response;
    },
};

export const getImageUrl = (url?: string | null): string => {
    if (!url) return "";

    if (/^https?:\/\//i.test(url)) {
        return url;
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

    return `${baseUrl.replace(/\/+$/, "")}/${url.replace(/^\/+/, "")}`;
};
