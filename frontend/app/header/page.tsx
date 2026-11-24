
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./header.css";

function Header() {
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(true);

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

                   

                </div>

            </div>
        </header>
    );
}

export default Header;
