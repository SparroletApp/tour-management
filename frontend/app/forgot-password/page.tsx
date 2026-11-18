
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

import "./forgot-password.css";
import userService from "../apiservice/userservice";

function ForgotPassword() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    });

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            Toast.fire({
                icon: "warning",
                title: "Please enter your email address",
            });
            return;
        }

        try {
            setLoading(true);

            const response = await userService.sendPasswordOtp({
                email: email.trim(),
            });

            await Toast.fire({
                icon: "success",
                title:
                    typeof response === "string"
                        ? response
                        : "OTP sent successfully",
            });

            setStep(2);
        } catch (error: any) {
            Toast.fire({
                icon: "error",
                title:
                    error?.response?.data?.message ||
                    "Unable to send OTP",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!otp.trim()) {
            Toast.fire({
                icon: "warning",
                title: "Please enter the OTP",
            });
            return;
        }

        try {
            setLoading(true);

            const response = await userService.verifyPasswordOtp({
                email: email.trim(),
                otp: otp.trim(),
            });

            await Toast.fire({
                icon: "success",
                title:
                    typeof response === "string"
                        ? response
                        : "OTP verified successfully",
            });

            setStep(3);
        } catch (error: any) {
            Toast.fire({
                icon: "error",
                title:
                    error?.response?.data?.message ||
                    "Invalid or expired OTP",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword.length < 6) {
            Toast.fire({
                icon: "warning",
                title: "Password must contain at least 6 characters",
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            Toast.fire({
                icon: "warning",
                title: "Passwords do not match",
            });
            return;
        }

        try {
            setLoading(true);

            const response = await userService.resetPassword({
                email: email.trim(),
                newPassword,
                confirmPassword,
            });

            await Toast.fire({
                icon: "success",
                title:
                    typeof response === "string"
                        ? response
                        : "Password reset successfully",
            });

            router.push("/");
        } catch (error: any) {
            Toast.fire({
                icon: "error",
                title:
                    error?.response?.data?.message ||
                    "Unable to reset password",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="forgot-password">
            <div className="forgot-password-card">

                <div className="forgot-password-icon">
                    <i className="bi bi-shield-lock"></i>
                </div>

                <h2>Forgot Password?</h2>

                <p className="forgot-description">
                    {step === 1 &&
                        "Enter your registered email address to receive an OTP."}
                    {step === 2 &&
                        "Enter the OTP sent to your registered email address."}
                    {step === 3 &&
                        "Create a new password for your account."}
                </p>

                <div className="forgot-steps">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className={`forgot-step ${
                                step >= item ? "active" : ""
                            }`}
                        >
                            {item}
                        </div>
                    ))}
                </div>

                {step === 1 && (
                    <form onSubmit={handleSendOtp}>
                        <div className="forgot-form-group">
                            <label>Email Address</label>

                            <div className="forgot-input-wrapper">
                                <i className="bi bi-envelope"></i>
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? "Sending OTP..." : "Send OTP"}
                            {!loading && (
                                <i className="bi bi-arrow-right"></i>
                            )}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOtp}>
                        <div className="forgot-form-group">
                            <label>Enter OTP</label>

                            <div className="forgot-input-wrapper">
                                <i className="bi bi-key"></i>
                                <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) =>
                                        setOtp(
                                            e.target.value
                                                .replace(/\D/g, "")
                                                .slice(0, 6)
                                        )
                                    }
                                    maxLength={6}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>

                        <button
                            type="button"
                            className="forgot-secondary-button"
                            disabled={loading}
                            onClick={() => {
                                setOtp("");
                                setStep(1);
                            }}
                        >
                            Change Email
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword}>
                        <div className="forgot-form-group">
                            <label>New Password</label>

                            <div className="forgot-input-wrapper">
                                <i className="bi bi-lock"></i>
                                <input
                                    type="password"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(e.target.value)
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="forgot-form-group">
                            <label>Confirm Password</label>

                            <div className="forgot-input-wrapper">
                                <i className="bi bi-lock-fill"></i>
                                <input
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                )}

                <div className="forgot-back">
                    <button
                        type="button"
                        onClick={() => router.push("/")}
                    >
                        <i className="bi bi-arrow-left"></i> Back to Login
                    </button>
                </div>

            </div>
        </section>
    );
}

export default ForgotPassword;
