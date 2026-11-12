"use client";

import { useRouter } from "next/navigation";
import { tourPackageService } from "../../apiservice/tourservice";
import Breadcrumb from "@/app/component/BreadCrumb";
import TourForm from "@/app/component/TourForm";
import { setSelectedTourId } from "@/app/utils/tourStorage";
import "./create-tours.css";

export default function CreateTourPage() {
    const router = useRouter();

    return (
        <>
            <Breadcrumb
                items={[{ label: "Home", href: "/" }, { label: "Tours", href: "/tours" }, { label: "Create" }]}
            />
            <h2 style={{ marginBottom: 16 }}>Create Tour</h2>

            <TourForm
                submitLabel="Create Tour"
                onSubmit={async (data) => {
                    const saved = await tourPackageService.createFull(data);
                    setSelectedTourId(saved.tourPackage.id as number);
                    router.push("/tours/view");
                }}
            />
        </>
    );
}
