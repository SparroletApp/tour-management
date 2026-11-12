
"use client";

import { useRef, useState } from "react";
import { uploadService, getImageUrl } from "../apiservice/uploadservice";
import "./image-upload.css";

interface ImageUploadProps {
    value?: string | string[] | null;
    onChange: (value: string | string[]) => void;
    multiple?: boolean;
    label?: string;
    disabled?: boolean;
}

export default function ImageUpload({
    value,
    onChange,
    multiple = false,
    label = "Upload Image",
    disabled = false,
}: ImageUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const images: string[] = Array.isArray(value)
        ? value
        : value
            ? [value]
            : [];

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = Array.from(event.target.files || []);

        if (!files.length) return;

        setError("");

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
        ];

        const invalidFile = files.find(
            (file) => !allowedTypes.includes(file.type)
        );

        if (invalidFile) {
            setError("Only JPG, PNG, WEBP and GIF images are allowed.");
            event.target.value = "";
            return;
        }

        const oversizedFile = files.find(
            (file) => file.size > 10 * 1024 * 1024
        );

        if (oversizedFile) {
            setError("Each image must be smaller than 10 MB.");
            event.target.value = "";
            return;
        }

        setUploading(true);

        try {
            const uploadedUrls: string[] = [];

            for (const file of files) {
                const response = await uploadService.uploadImage(file);
                uploadedUrls.push(response.imageUrl);
            }

            if (multiple) {
                onChange([...images, ...uploadedUrls]);
            } else {
                onChange(uploadedUrls[0]);
            }
        } catch (err) {
            console.error("Image upload error:", err);
            setError("Image upload failed. Please try again.");
        } finally {
            setUploading(false);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const removeImage = (index: number) => {
        const updatedImages = images.filter(
            (_, imageIndex) => imageIndex !== index
        );

        if (multiple) {
            onChange(updatedImages);
        } else {
            onChange("");
        }
    };

    return (
        <div className="image-upload-wrapper">
            <label className="image-upload-label">{label}</label>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple={multiple}
                disabled={disabled || uploading}
                onChange={handleFileChange}
                className="image-upload-input"
            />

            <div
                className={`image-upload-box ${
                    disabled || uploading ? "disabled" : ""
                }`}
                onClick={() => {
                    if (!disabled && !uploading) {
                        fileInputRef.current?.click();
                    }
                }}
            >
                {uploading ? (
                    <>
                        <div className="image-upload-spinner" />
                        <span>Uploading image...</span>
                    </>
                ) : (
                    <>
                        <i className="bi bi-cloud-arrow-up-fill" />
                        <strong>Click to upload</strong>
                        <span>
                            {multiple
                                ? "Select one or more images"
                                : "Select an image from your computer"}
                        </span>
                        <small>JPG, PNG, WEBP or GIF · Maximum 10 MB</small>
                    </>
                )}
            </div>

            {error && (
                <div className="image-upload-error">
                    <i className="bi bi-exclamation-circle" />
                    {error}
                </div>
            )}

            {images.length > 0 && (
                <div className="image-preview-grid">
                    {images.map((image, index) => (
                        <div
                            className="image-preview-item"
                            key={`${image}-${index}`}
                        >
                            <img
                                src={getImageUrl(image)}
                                alt={`Uploaded image ${index + 1}`}
                            />

                            <button
                                type="button"
                                className="image-remove-button"
                                disabled={disabled || uploading}
                                onClick={() => removeImage(index)}
                                title="Remove image"
                            >
                                <i className="bi bi-x-lg" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
