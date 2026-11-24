
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

interface ProtectedRouteProps {
    children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const pathname = usePathname();
    const router = useRouter();

    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const publicRoutes = ["/", "/form", "/tour-list"];

        const isPublicRoute =
            publicRoutes.includes(pathname) ||
            pathname.startsWith("/tour-details/");

        if (isPublicRoute) {
            setIsAuthorized(true);
            return;
        }

        const token = sessionStorage.getItem("access_token");

        if (!token) {
            router.replace("/");
            return;
        }

        setIsAuthorized(true);
    }, [pathname, router]);

    if (!isAuthorized) {
        return null;
    }

    return <>{children}</>;
}
