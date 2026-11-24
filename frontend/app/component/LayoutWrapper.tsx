
"use client";

import { usePathname } from "next/navigation";
import Sidebar from "../sidebar/page";
import ProtectedRoute from "./ProtectedRoute";

export default function LayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const hideLayout =
        pathname === "/" ||
        pathname === "/login" ||
        pathname === "/super-admin/login" ||
        pathname === "/form" ||
           pathname === "/forgot-password" ||
           pathname === "/tour-list" ||
        pathname.startsWith("/tour-form/") ||
        pathname.startsWith("/tour-details/");

    if (hideLayout) {
        return <>{children}</>;
    }

    return (
        <ProtectedRoute>
            <div className="app-layout">
                <Sidebar />

                <main className="main-content">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}
