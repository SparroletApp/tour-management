
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

import userService, {
    UserCreateDto,
} from "@/app/apiservice/userservice";

import "./create-user.css";

function CreateUser() {
    const router = useRouter();

    const [companyId, setCompanyId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    });
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "STAFF",
    });

    useEffect(() => {
        const storedId = localStorage.getItem("company_view_id");
        const id = Number(storedId);

        if (!storedId || !Number.isInteger(id) || id <= 0) {
           Toast.fire({
                icon: "error",
                title: "Company Not Found",
                text: "Please select a company before creating a user.",
                confirmButtonColor: "#064e45",
            }).then(() => {
                router.push("/admin/companies");
            });

            return;
        }

        setCompanyId(id);
    }, [router]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const generatePassword = () => {
        const chars =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!";

        const randomValues = new Uint32Array(12);
        window.crypto.getRandomValues(randomValues);

        const password = Array.from(randomValues)
            .map((value) => chars[value % chars.length])
            .join("");

        setFormData((prev) => ({
            ...prev,
            password,
        }));
    };
    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        if (!companyId) {
            Toast.fire({
                icon: "error",
                title: "Company ID is missing.",
            });
            return;
        }

        if (formData.password.length < 6) {
            Toast.fire({
                icon: "warning",
                title: "Password must contain at least 6 characters.",
            });
            return;
        }

        if (!formData.name.trim() || !formData.email.trim()) {
            Toast.fire({
                icon: "warning",
                title: "Please fill in all required fields.",
            });
            return;
        }

        try {
            setSaving(true);

            const request: UserCreateDto = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                password: formData.password,
                role: formData.role,
                companyId: companyId,
            };

            await userService.register(request);

            await Toast.fire({
                icon: "success",
                title: "User created successfully!",
            });

            router.push("/admin/companies/view");

        } catch (error: any) {
            console.error("Create user error:", error);

            Toast.fire({
                icon: "error",
                title:
                    error?.response?.data?.message ||
                    (typeof error?.response?.data === "string"
                        ? error.response.data
                        : "Unable to create user. Please try again."),
            });

        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="create-user-page">

            {/* Page Header */}
            <div className="create-user-header">
                <div className="create-user-heading">
                    <button
                        type="button"
                        className="create-user-back-btn"
                        onClick={() => router.push("/admin/companies/view")}
                    >
                        <i className="bi bi-arrow-left"></i>
                    </button>

                    <div>
                        <h2>Create User</h2>
                        <p>
                            Add a new manager or staff member to your company.
                        </p>
                    </div>
                </div>

                <div className="create-user-company">
                    <i className="bi bi-buildings"></i>
                    Company ID: <strong>{companyId ?? "Loading..."}</strong>
                </div>
            </div>

            {/* Form Card */}
            <div className="create-user-card">

                <div className="create-user-card-header">
                    <div className="create-user-card-icon">
                        <i className="bi bi-person-plus"></i>
                    </div>

                    <div>
                        <h4>User Information</h4>
                        <p>Enter the details to create a new account.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>

                    <div className="create-user-form-grid">

                        {/* Name */}
                        <div className="create-user-form-group">
                            <label htmlFor="name">
                                Full Name <span>*</span>
                            </label>

                            <div className="create-user-input-wrapper">
                                <i className="bi bi-person"></i>

                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder="Enter full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="create-user-form-group">
                            <label htmlFor="email">
                                Email Address <span>*</span>
                            </label>

                            <div className="create-user-input-wrapper">
                                <i className="bi bi-envelope"></i>

                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="Enter email address"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="create-user-form-group">
                            <label htmlFor="phone">
                                Phone Number
                            </label>

                            <div className="create-user-input-wrapper">
                                <i className="bi bi-telephone"></i>

                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    placeholder="Enter phone number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Role */}
                        <div className="create-user-form-group">
                            <label htmlFor="role">
                                Select Role <span>*</span>
                            </label>

                            <div className="create-user-input-wrapper">
                                <i className="bi bi-shield-check"></i>

                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="STAFF">Staff</option>
                                    <option value="MANAGER">Manager</option>
                                </select>
                            </div>
                        </div>

                        {/* Password */}
                        <div className="create-user-form-group full-width">
                            <label htmlFor="password">
                                Password <span>*</span>
                            </label>

                            <div className="create-user-password-wrapper">
                                <div className="create-user-input-wrapper">
                                    <i className="bi bi-lock"></i>

                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        placeholder="Enter or generate password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        minLength={6}
                                        required
                                    />

                                    <button
                                        type="button"
                                        className="create-user-eye-btn"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        title={showPassword ? "Hide password" : "Show password"}
                                    >
                                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    className="create-user-generate-btn"
                                    onClick={generatePassword}
                                >
                                    <i className="bi bi-shuffle"></i>
                                    Generate Password
                                </button>
                            </div>

                            <small>
                                Generate a password or enter your own. Minimum 6 characters.
                            </small>
                        </div>

                    </div>

                    {/* Company ID */}
                    <div className="create-user-company-info">
                        <i className="bi bi-info-circle"></i>
                        This user will automatically be registered under company
                        <strong> #{companyId ?? "-"}</strong>.
                    </div>

                    {/* Buttons */}
                    <div className="create-user-actions">

                        <button
                            type="button"
                            className="create-user-cancel-btn"
                            onClick={() => router.push("/admin/companies/views")}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="create-user-submit-btn"
                            disabled={saving || !companyId}
                        >
                            {saving ? (
                                <>
                                    <span className="spinner-border spinner-border-sm"></span>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-person-check"></i>
                                    Create User
                                </>
                            )}
                        </button>

                    </div>

                </form>
            </div>
        </section>
    );
}

export default CreateUser;
