
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

import userService from "@/app/apiservice/userservice";
import "./login.css";

export default function LoginPage() {
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [year, setYear] = useState<number | null>(null);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {
        setYear(new Date().getFullYear());
    }, []);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Required Fields",
                text: "Please enter your email and password.",
                confirmButtonColor: "#064e45",
            });
            return;
        }

        try {
            setLoading(true);
            sessionStorage.removeItem("access_token");

            const response = await userService.login({
                email: email.trim(),
                password,
            });

            if (!response?.token) {
                throw new Error("Authentication token not received from server.");
            }
            sessionStorage.setItem("access_token", response.token);
            sessionStorage.setItem("email", email.trim());

            if (response.user) {
                sessionStorage.setItem(
                    "user",
                    JSON.stringify(response.user)
                );
            }

            if (response.user?.role) {
                sessionStorage.setItem("user_role", response.user.role);
            }

            if (rememberMe) {
                localStorage.setItem("remembered_email", email.trim());
            } else {
                localStorage.removeItem("remembered_email");
            }

            await Swal.fire({
                icon: "success",
                title: "Login Successful!",
                text: "Welcome back.",
                timer: 1500,
                showConfirmButton: false,
            });

            router.replace("/dashboard");

        } catch (error: unknown) {
            let message = "Invalid email or password. Please try again.";

            if (error && typeof error === "object" && "response" in error) {
                const apiError = error as {
                    response?: {
                        data?: {
                            message?: string;
                            error?: string;
                        };
                    };
                };

                message =
                    apiError.response?.data?.message ||
                    apiError.response?.data?.error ||
                    message;
            } else if (error instanceof Error) {
                message = error.message;
            }

            Swal.fire({
                icon: "error",
                title: "Login Failed",
                text: message,
                confirmButtonColor: "#064e45",
            });

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">

                <div className="login-logo">
                    <div className="login-logo-icon">
                        <i className="bi bi-shield-lock"></i>
                    </div>

                    <h2>Welcome Back</h2>
                    <p>Sign in to continue to your account</p>
                </div>

                <form onSubmit={handleLogin}>

                    <div className="login-field">
                        <label>Email Address</label>

                        <div className="login-input">
                            <i className="bi bi-envelope"></i>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                required
                            />
                        </div>
                    </div>

                    <div className="login-field">
                        <label>Password</label>

                        <div className="login-input">
                            <i className="bi bi-lock"></i>

                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={
                                    showPassword ? "Hide password" : "Show password"
                                }
                            >
                                <i
                                    className={`bi ${showPassword
                                            ? "bi-eye-slash"
                                            : "bi-eye"
                                        }`}
                                ></i>
                            </button>
                        </div>
                    </div>

                    <div className="login-options">
                        <label>
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) =>
                                    setRememberMe(e.target.checked)
                                }
                            />
                            Remember me
                        </label>

                        <a href="/forgot-password">
                            Forgot password?
                        </a>
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Signing In...
                            </>
                        ) : (
                            <>
                                Sign In
                                <i className="bi bi-arrow-right"></i>
                            </>
                        )}
                    </button>

                </form>

                <div className="login-footer">
                    © {year ?? ""} All rights reserved.
                </div>

            </div>
        </div>
    );
}
