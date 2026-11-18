
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import userService from "@/app/apiservice/userservice";
import "./admin-login.css";

function AdminLogin() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    
const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
        Swal.fire({
            icon: "warning",
            title: "Required Fields",
            text: "Please enter email and password.",
        });
        return;
    }

    try {
        setLoading(true);

        sessionStorage.clear();

        const response = await userService.login({
            email: email.trim(),
            password,
        });

        if (response.user.role !== "ADMIN") {
            Swal.fire({
                icon: "error",
                title: "Access Denied",
                text: "Only ADMIN users are allowed to login here.",
            });
            return;
        }

        sessionStorage.setItem("access_token", response.token);

        sessionStorage.setItem(
            "user",
            JSON.stringify(response.user)
        );

        sessionStorage.setItem("user_role", response.user.role);
        sessionStorage.setItem("userId", String(response.user.id));
        sessionStorage.setItem("email", response.user.email);
        sessionStorage.setItem("name", response.user.name);

        await Swal.fire({
            icon: "success",
            title: "Login Successful",
            text: response.message,
            timer: 1500,
            showConfirmButton: false,
        });

        router.push("/admin/dashboard");

    } catch (error: any) {
        const message =
            error?.response?.data?.message ||
            "Invalid email or password.";

        Swal.fire({
            icon: "error",
            title: "Login Failed",
            text: message,
        });
    } finally {
        setLoading(false);
    }
};


    return (
        <section className="admin-login">
            <div className="admin-login-card">

                <h2>Rayloop Login</h2>
                <p>Login to access the admin dashboard</p>

                <form onSubmit={handleLogin}>

                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>
            </div>
        </section>
    );
}

export default AdminLogin;
