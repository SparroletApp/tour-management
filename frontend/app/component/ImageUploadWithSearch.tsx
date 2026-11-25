"use client";

import { useState } from "react";
import ImageUpload from "./ImageUpload";
import ImageSearchModal from "./ImageSearchModal";

export default function ImageUploadWithSearch({
    label,
    value,
    multiple,
    onChange,
    searchHint = "",
}: {
    label: string;
    value: any;
    multiple: boolean;
    onChange: (value: any) => void;
    searchHint?: string;
}) {
    const [open, setOpen] = useState(false);

    return (
        <div>
            <ImageUpload
                label={label}
                value={value}
                multiple={multiple}
                onChange={onChange}
            />

            <button
                type="button"
                className="tour-add-btn"
                onClick={() => setOpen(true)}
            >
                <i className="bi bi-search" />
                Search online images
            </button>

            <ImageSearchModal
                open={open}
                initialQuery={searchHint}
                multiple={multiple}
                onClose={() => setOpen(false)}
                onSelect={(urls) =>
                    multiple
                        ? onChange([...(Array.isArray(value) ? value : []), ...urls])
                        : onChange(urls[0])
                }
            />
        </div>
    );
}