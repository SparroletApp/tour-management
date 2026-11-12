"use client";

import { usePathname } from "next/navigation";
import Sidebar from "../sidebar/page";

export default function LayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const hideLayout =
        pathname === "/" ||
        pathname === "/login" ||
        pathname.startsWith("/tour-form/") ||
        pathname.startsWith("/tour-details/");

    if (hideLayout) {
        return <>{children}</>;
    }

    return (
        <div className="app-layout">
            <Sidebar />

            <main className="main-content">
                {children}
            </main>
        </div>
    );
}