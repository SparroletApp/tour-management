
"use client";

import { useEffect, useState } from "react";
import {
    importImage,
    OnlineImage,
    searchImages,
} from "../apiservice/imageservice";

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
    const [loadingMore, setLoadingMore] = useState(false);
    const [importing, setImporting] = useState(false);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const runSearch = async (
        searchQuery: string,
        searchPage = 1,
        append = false
    ) => {
        if (!searchQuery.trim()) {
            setError("Please enter a search keyword.");
            return;
        }

        try {
            append ? setLoadingMore(true) : setLoading(true);
            setError("");

            if (!append) {
                setResults([]);
                setSelected([]);
                setPage(1);
            }

            setHasSearched(true);

            const images = await searchImages(
                searchQuery.trim(),
                searchPage
            );

            if (append) {
                setResults((previous) => {
                    const existingIds = new Set(
                        previous.map((item) => item.id)
                    );

                    return [
                        ...previous,
                        ...images.filter(
                            (item) => !existingIds.has(item.id)
                        ),
                    ];
                });
            } else {
                setResults(images);
            }

            setPage(searchPage);
            setHasMore(images.length > 0);

        } catch (err: any) {
            console.error("Image search error:", err);

            setError(
                err?.response?.data?.message ||
                "Unable to search images. Please try again."
            );
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        if (!open) return;

        setQuery(initialQuery);
        setResults([]);
        setSelected([]);
        setError("");
        setHasSearched(false);
        setPage(1);
        setHasMore(false);

        if (initialQuery.trim()) {
            runSearch(initialQuery, 1);
        }
    }, [open, initialQuery]);

    if (!open) return null;

    const toggle = (image: OnlineImage) => {
        setSelected((previous) => {
            const exists = previous.some(
                (item) => item.id === image.id
            );

            if (exists) {
                return previous.filter(
                    (item) => item.id !== image.id
                );
            }

            return multiple
                ? [...previous, image]
                : [image];
        });
    };

    const handleImport = async () => {
        if (!selected.length) return;

        try {
            setImporting(true);
            setError("");

            const urls: string[] = [];

            for (const image of selected) {
                const url = await importImage(image);
                urls.push(url);
            }

            onSelect(urls);
            onClose();

        } catch (err: any) {
            console.error("Image import error:", err);

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to import selected images."
            );
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="image-search-overlay">
            <div className="image-search-modal">

                <div className="image-search-header">
                    <div>
                        <h3>Search Online Images</h3>
                        <p>Find images for your tour package.</p>
                    </div>

                    <button
                        type="button"
                        className="image-search-close"
                        onClick={onClose}
                        disabled={importing}
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
                        disabled={loading || importing}
                    >
                        <i className="bi bi-search" />
                        {loading ? "Searching..." : "Search"}
                    </button>
                </div>

                {error && (
                    <div className="image-search-error">
                        <i className="bi bi-exclamation-circle" />
                        {error}
                    </div>
                )}

                {loading && (
                    <div className="image-search-empty">
                        Searching images...
                    </div>
                )}

                {!loading && hasSearched && results.length === 0 && (
                    <div className="image-search-empty">
                        No images found. Try another keyword.
                    </div>
                )}

                {!loading && results.length > 0 && (
                    <>
                        <div className="image-search-result-heading">
                            <h4>Search Results</h4>
                            <span>{results.length} images</span>
                        </div>

                        <div className="image-search-grid">
                            {results.map((img) => {
                                const isSelected = selected.some(
                                    (item) => item.id === img.id
                                );

                                return (
                                    <button
                                        type="button"
                                        key={img.id}
                                        className={`image-search-card ${
                                            isSelected ? "selected" : ""
                                        }`}
                                        onClick={() => toggle(img)}
                                        disabled={importing}
                                    >
                                        <img
                                            src={img.preview}
                                            alt={img.photographer || "Unsplash image"}
                                            loading="lazy"
                                        />

                                        <span className="image-search-select-indicator">
                                            <i className={`bi ${
                                                isSelected
                                                    ? "bi-check-circle-fill"
                                                    : "bi-plus-circle"
                                            }`} />
                                        </span>

                                        <span className="image-search-credit">
                                            {img.photographer}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {hasMore && (
                            <div className="image-search-load-more">
                                <button
                                    type="button"
                                    disabled={loadingMore || importing}
                                    onClick={() =>
                                        runSearch(query, page + 1, true)
                                    }
                                >
                                    {loadingMore
                                        ? "Loading..."
                                        : "Load More"}
                                </button>
                            </div>
                        )}
                    </>
                )}

                {!loading && !hasSearched && (
                    <div className="image-search-empty">
                        Search for a destination or activity.
                    </div>
                )}

                {selected.length > 0 && (
                    <div className="image-selected-section">
                        <h4>
                            Selected Images ({selected.length})
                        </h4>

                        <div className="image-selected-grid">
                            {selected.map((img) => (
                                <div
                                    className="image-selected-card"
                                    key={img.id}
                                >
                                    <img
                                        src={img.preview}
                                        alt={img.photographer}
                                    />

                                    <button
                                        type="button"
                                        className="image-remove-btn"
                                        onClick={() => toggle(img)}
                                        disabled={importing}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="image-search-footer">
                    <small>
                        Photos by{" "}
                        <a
                            href="https://unsplash.com"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Unsplash
                        </a>
                    </small>

                    <div className="image-search-footer-actions">
                        <button
                            type="button"
                            className="image-search-cancel"
                            onClick={onClose}
                            disabled={importing}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            className="image-use-btn"
                            onClick={handleImport}
                            disabled={!selected.length || importing}
                        >
                            {importing
                                ? "Importing..."
                                : `Use ${selected.length} selected`}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
