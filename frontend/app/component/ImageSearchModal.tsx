"use client";

import { useEffect, useState } from "react";
import { importImage, OnlineImage, searchImages } from "../apiservice/imageservice";
import "./image-upload.css";

export default function ImageSearchModal({
    open,
    initialQuery = "",
    multiple,
    onClose,
    onSelect,
}: {
    open: boolean;
    initialQuery?: string;
    multiple: boolean;
    onClose: () => void;
    onSelect: (urls: string[]) => void;
}) {
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState<OnlineImage[]>([]);
    const [selected, setSelected] = useState<OnlineImage[]>([]);
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [error, setError] = useState("");

    const runSearch = async (q: string) => {
        if (!q.trim()) return;
        try {
            setLoading(true);
            setError("");
            setResults(await searchImages(q.trim()));
        } catch {
            setError("Search failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (open) {
            setQuery(initialQuery);
            setSelected([]);
            setResults([]);
            setError("");
            if (initialQuery.trim()) runSearch(initialQuery);
        }
    }, [open]);

    if (!open) return null;

    const toggle = (img: OnlineImage) => {
        const exists = selected.some((s) => s.id === img.id);
        if (!multiple) return setSelected(exists ? [] : [img]);
        setSelected(
            exists ? selected.filter((s) => s.id !== img.id) : [...selected, img]
        );
    };

    const confirm = async () => {
        try {
            setImporting(true);
            setError("");
            const urls: string[] = [];
            for (const s of selected) {
                urls.push(await importImage(s.full));
            }
            onSelect(urls);
            onClose();
        } catch (e: any) {
            setError(
                e?.response?.data?.message || "Could not import the selected image(s)."
            );
        } finally {
            setImporting(false);
        }
    };


    return (
        <div className="image-search-overlay">
            <div className="image-search-modal">

                <div className="image-search-header">
                    <h3>Search Images</h3>
                    <button
                        type="button"
                        className="image-search-close"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <div className="image-search-toolbar">
                    <input
                        className="image-search-input"
                        value={query}
                        placeholder="Search images (e.g. Bali beaches)"
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                runSearch(query);
                            }
                        }}
                    />

                    <button
                        type="button"
                        className="image-search-btn"
                        onClick={() => runSearch(query)}
                        disabled={loading}
                    >
                        {loading ? "Searching..." : "Search"}
                    </button>
                </div>

                {loading && (
                    <div className="image-search-empty">
                        Searching images...
                    </div>
                )}

                {!loading && results.length === 0 && (
                    <div className="image-search-empty">
                        No images found. Search for a destination or activity.
                    </div>
                )}

                <div className="image-search-grid">
                    {results.map((img) => {
                        const isSelected = selected.some(
                            (s) => s.id === img.id
                        );

                        return (
                            <div
                                key={img.id}
                                className={`image-search-card ${isSelected ? "selected" : ""
                                    }`}
                                onClick={() => toggle(img)}
                            >
                                <img src={img.thumb} alt={img.credit} />
                            </div>
                        );
                    })}
                </div>

                {selected.length > 0 && (
                    <div className="image-selected-section">
                        <h4>Selected Images ({selected.length})</h4>

                        <div className="image-selected-grid">
                            {selected.map((img) => (
                                <div
                                    className="image-selected-card"
                                    key={img.id}
                                >
                                   <img src={img.thumb} alt={img.credit} />

                                    <button
                                        type="button"
                                        className="image-remove-btn"
                                        onClick={() => toggle(img)}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {error && (
                    <div className="image-search-error">
                        {error}
                    </div>
                )}

                <div className="image-search-footer">
                    <small>
                        Images from{" "}
                        <a
                            href="https://pixabay.com"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Pixabay
                        </a>
                    </small>

                    <button
                        type="button"
                        className="image-use-btn"
                        onClick={confirm}
                        disabled={!selected.length || importing}
                    >
                        {importing
                            ? "Importing..."
                            : `Use ${selected.length} selected`}
                    </button>
                </div>
            </div>
        </div>
    );

}