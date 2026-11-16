
import api from "./apiservice";
import axios from "axios";

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
                    "Content-Type": undefined as any,
                },
            }
        );

        return response;
    },
};

export const getImageUrl = (url?: string | null): string => {
    if (!url) return "";

    // Already a complete URL (Garage S3 URL)
    if (/^https?:\/\//i.test(url)) {
        return url;
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

    return `${baseUrl.replace(/\/+$/, "")}/${url.replace(/^\/+/, "")}`;
};
