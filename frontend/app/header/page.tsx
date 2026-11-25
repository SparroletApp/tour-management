
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

    const phoneNumber = "971 58 500 6990";


    return (
        <header className="main-header">
            <div className="header-container">
                <div
                    className="header-logo"
                    onClick={() => scrollToSection("home")}>
                    <div className="header-logo-image">
                        <img
                            src="/bonv-logo.png"
                            alt="Tour Management Logo"
                        />
                    </div>
                </div>
                    <div className="header-right">
                    <a
                        href={`tel:${phoneNumber.replace(/\s/g, "")}`}
                        className="header-call-btn"
                    >
                        <span className="header-call-icon">
                            <i className="bi bi-telephone-fill"></i>
                        </span>

                        <span className="header-call-text">
                            <small>Call Us Now</small>
                            <strong>{phoneNumber}</strong>
                        </span>
                    </a>
                </div>
            </div>
        </header>
    );
}

export default Header;
