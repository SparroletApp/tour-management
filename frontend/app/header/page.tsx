
"use client";

import { useRouter } from "next/navigation";
import "./header.css";

function Header() {
    const router = useRouter();

    const handleLogout = () => {
        sessionStorage.clear();
        router.push("/login");
    };

    const scrollToSection = (sectionId: string) => {
        document.getElementById(sectionId)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    return (
        <header className="main-header">

            <div
                className="header-logo"
                onClick={() => scrollToSection("home")}
            >
                <i className="bi bi-globe-americas"></i>
                <span>Tour Management</span>
            </div>

            <nav className="header-nav">
                <button onClick={() => scrollToSection("home")}>
                    <i className="bi bi-house"></i>
                    Home
                </button>

                <button onClick={() => scrollToSection("available-tours")}>
                    <i className="bi bi-map"></i>
                    Available Tours
                </button>
            </nav>

            <div className="header-right">

                <button
                    className="header-login-btn"
                    onClick={() => router.push("/login")}
                >
                    <i className="bi bi-box-arrow-in-right"></i>
                    Login
                </button>

                <button
                    className="header-logout-btn"
                    onClick={handleLogout}
                >
                    <i className="bi bi-box-arrow-right"></i>
                    Logout
                </button>

            </div>

        </header>
    );
}

export default Header;
