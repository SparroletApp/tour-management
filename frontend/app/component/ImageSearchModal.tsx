"use client";

import { useEffect, useState } from "react";
import { importImage, OnlineImage, searchImages } from "../apiservice/imageservice";

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
            const urls = await Promise.all(selected.map((s) => importImage(s.full)));
            onSelect(urls);
            onClose();
        } catch {
            setError("Could not import the selected image(s).");
        } finally {
            setImporting(false);
        }
    };

    return (
        <div
            style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 2000,
                display: "flex", alignItems: "center", justifyContent: "center",
            }}
        >
            <div
                style={{
                    background: "#fff", borderRadius: 12, width: "min(900px, 94vw)",
                    maxHeight: "88vh", overflow: "auto", padding: 20,
                }}
            >
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    <input
                        style={{ flex: 1, padding: 8 }}
                        value={query}
                        placeholder="Search images (e.g. Dubai skyline)"
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                runSearch(query);
                            }
                        }}
                    />
                    <button type="button" onClick={() => runSearch(query)} disabled={loading}>
                        {loading ? "Searching..." : "Search"}
                    </button>
                    <button type="button" onClick={onClose}>Close</button>
                </div>

                {!loading && results.length === 0 && (
                    <p style={{ color: "#666" }}>Type a place or hotel name and press Search.</p>
                )}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                        gap: 8,
                    }}
                >
                    {results.map((img) => {
                        const isSel = selected.some((s) => s.id === img.id);
                        return (
                            <img
                                key={img.id}
                                src={img.thumb}
                                alt={img.credit}
                                onClick={() => toggle(img)}
                                style={{
                                    width: "100%", height: 110, objectFit: "cover",
                                    cursor: "pointer", borderRadius: 6,
                                    outline: isSel ? "3px solid #2563eb" : "none",
                                }}
                            />
                        );
                    })}
                </div>

                {error && <p style={{ color: "crimson" }}>{error}</p>}

                <div
                    style={{
                        display: "flex", justifyContent: "space-between",
                        alignItems: "center", marginTop: 12,
                    }}
                >
                    <small>
                        Images from{" "}
                        <a href="https://pixabay.com" target="_blank" rel="noreferrer">Pixabay</a>
                    </small>
                    <button
                        type="button"
                        onClick={confirm}
                        disabled={!selected.length || importing}
                    >
                        {importing ? "Importing..." : `Use ${selected.length || ""} selected`}
                    </button>
                </div>
            </div>
        </div>
    );
}