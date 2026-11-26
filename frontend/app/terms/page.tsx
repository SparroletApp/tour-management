
"use client";

import { useEffect, useState } from "react";

import termsService, {
    Terms as TermsType,
} from "@/app/apiservice/termsservice";

import "./terms.css";

interface TermsProps {
    open: boolean;
    onClose: () => void;
    companyId?: number;
}

function Terms({
    open,
    onClose,
    companyId,
}: TermsProps) {
    const [terms, setTerms] = useState<TermsType[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) return;

        if (!companyId || !Number.isFinite(companyId)) {
            setTerms([]);
            setError("Company information is not available.");
            return;
        }

        const fetchTerms = async () => {
            setLoading(true);
            setError("");

            try {
                const response =
                    await termsService.getByCompanyId(companyId);

                setTerms(response || []);
            } catch (err: any) {
                console.error("Error fetching terms:", err);

                setError(
                    err?.response?.data?.message ||
                    "Unable to load Terms and Conditions."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchTerms();
    }, [open, companyId]);

    if (!open) return null;

    return (
        <div className="terms-overlay" onClick={onClose}>
            <section
                className="terms-ui"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="terms-header">
                    <div>
                        <span className="terms-label">
                            IMPORTANT INFORMATION
                        </span>
                        <h2>Terms and Conditions</h2>
                    </div>

                    <button
                        type="button"
                        className="terms-close"
                        onClick={onClose}
                        aria-label="Close terms"
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="terms-content">
                    {loading ? (
                        <div className="terms-loading">
                            <span className="terms-loading-spinner"></span>
                            <p>Loading Terms and Conditions...</p>
                        </div>
                    ) : error ? (
                        <div className="terms-error">
                            <i className="bi bi-exclamation-circle"></i>
                            <p>{error}</p>
                        </div>
                    ) : terms.length === 0 ? (
                        <div className="terms-empty">
                            <i className="bi bi-file-earmark-text"></i>
                            <p>
                                No Terms and Conditions available for this
                                company.
                            </p>
                        </div>
                    ) : (
                        <div className="terms-list">
                            {terms.map((item) => (
                                <article
                                    className="terms-item"
                                    key={item.id}
                                >
                                    <h6>{item.name}</h6>

                                    <div
                                        className="terms-description"
                                        dangerouslySetInnerHTML={{
                                            __html: item.description || "",
                                        }}
                                    />
                                </article>
                            ))}
                        </div>
                    )}
                </div>

                <div className="terms-footer">
                    <button
                        type="button"
                        onClick={onClose}
                        className="terms-close-btn"
                    >
                        Close
                    </button>
                </div>
            </section>
        </div>
    );
}

export default Terms;
