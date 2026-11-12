"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TourPackageFull } from "@/app/types/tour";
import { getSelectedTourId } from "@/app/utils/tourStorage";
import { tourPackageService } from "@/app/apiservice/tourservice";
import Breadcrumb from "@/app/component/BreadCrumb";
import TourForm from "@/app/component/TourForm";
import "./edit-tours.css";

export default function EditTourPage() {
    const router = useRouter();
    const [id, setId] = useState<string | null>(null);
    const [tour, setTour] = useState<TourPackageFull | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const stored = getSelectedTourId();
        if (!stored) {
            router.replace("/tours"); // nothing selected: go back to the list
            return;
        }
        setId(stored);

        const load = async () => {
            try {
                setTour(await tourPackageService.getFull(stored));
            } catch (e) {
                setError("Failed to load tour");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [router]);

  return (
    <div className="edit-tour-page">
        <Breadcrumb
            items={[
                { label: "Home", href: "/" },
                { label: "Tours", href: "/tours" },
                {
                    label: tour?.tourPackage.tourName ?? "Tour",
                    href: "/tours/view",
                },
                { label: "Edit" },
            ]}
        />

        <div className="edit-tour-header">
            <div>
                <h2>Edit Tour</h2>
                <p className="edit-tour-description">
                    Update tour details, destinations, itinerary, hotels and pricing.
                </p>
            </div>
        </div>

        {loading && (
            <div className="edit-tour-loading">
                <span className="edit-tour-spinner"></span>
                Loading tour details...
            </div>
        )}

        {error && (
            <div className="edit-tour-error">
                {error}
            </div>
        )}

        {tour && id && (
            <div className="edit-tour-container">
                <TourForm
                    initial={tour}
                    submitLabel="Save Changes"
                    onSubmit={async (data) => {
                        await tourPackageService.updateFull(id, data);
                        router.push("/tours/view");
                    }}
                />
            </div>
        )}
    </div>
);
}
