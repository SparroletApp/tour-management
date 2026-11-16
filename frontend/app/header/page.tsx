
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./header.css";

function Header() {
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        sessionStorage.clear();
        router.push("/login");
    };

    const scrollToSection = (sectionId: string) => {
        document.getElementById(sectionId)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });

        setMenuOpen(false);
    };

    return (
        <header className="main-header">
            <div className="header-container">

                {/* LEFT SIDE - LOGO */}
                <div
                    className="header-logo"
                    onClick={() => scrollToSection("home")}
                >
                    <div className="header-logo-image">
                        <img
                            src="/bonv-logo.png"
                            alt="Tour Management Logo"
                        />
                    </div>

                </div>

                {/* MOBILE MENU BUTTON */}
                <button
                    className="mobile-menu-btn"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle navigation"
                    aria-expanded={menuOpen}
                >
                    <i
                        className={`bi ${
                            menuOpen ? "bi-x-lg" : "bi-list"
                        }`}
                    ></i>
                </button>

                {/* CENTER - NAVIGATION */}
                {/* <nav className={`header-nav ${menuOpen ? "active" : ""}`}>

                    <button
                        className="nav-link active"
                        onClick={() => scrollToSection("home")}
                    >
                        <i className="bi bi-house-door"></i>
                        <span>Home</span>
                    </button>

                    <button
                        className="nav-link"
                        onClick={() => scrollToSection("available-tours")}
                    >
                        <i className="bi bi-compass"></i>
                        <span>Available Tours</span>
                    </button>

                </nav> */}

                {/* RIGHT SIDE - AUTH BUTTONS */}
                <div className={`header-right ${menuOpen ? "active" : ""}`}>

                    <button
                        className="header-login-btn"
                        onClick={() => {
                            setMenuOpen(false);
                            router.push("/login");
                        }}
                    >
                        <i className="bi bi-box-arrow-in-right"></i>
                        <span>Login</span>
                    </button>

                    <button
                        className="header-logout-btn"
                        onClick={handleLogout}
                    >
                        <i className="bi bi-box-arrow-right"></i>
                        <span>Logout</span>
                    </button>

                </div>

            </div>
        </header>
    );
}

export default Header;
