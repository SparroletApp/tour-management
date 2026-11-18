
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

import userService, {
    UserIdDto,
    UserResponseDto,
    UserUpdateDto,
} from "@/app/apiservice/userservice";

import "./edit-user.css";

function EditUser() {
    const router = useRouter();

    const [userId, setUserId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    });

    const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    });

    useEffect(() => {
        const storedId = localStorage.getItem("edit_user_id");
        const id = Number(storedId);

        if (!storedId || !Number.isInteger(id) || id <= 0) {
            Toast.fire({
                icon: "error",
                title: "Invalid user ID.",
            }).then(() => {
                router.push("/admin/companies/view");
            });

            setLoading(false);
            return;
        }

        setUserId(id);
        fetchUser(id);
    }, []);

    const fetchUser = async (id: number) => {
        try {
            setLoading(true);

            const request: UserIdDto = {
                id: id,
            };

            const response: UserResponseDto =
                await userService.getUserById(request);

            if (!response) {
                throw new Error("User not found.");
            }

            setFormData({
                name: response.name || "",
                email: response.email || "",
                phone: response.phone || "",
            });

        } catch (error: any) {
            console.error("Fetch user error:", error);

            Toast.fire({
                icon: "error",
                title:
                    error?.response?.data?.message ||
                    "Unable to load user details.",
            }).then(() => {
                router.push("/admin/companies/view");
            });

        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        if (!userId) {
            Toast.fire({
                icon: "error",
                title: "User ID is missing.",
            });
            return;
        }

        if (!formData.name.trim() || !formData.email.trim()) {
            Toast.fire({
                icon: "warning",
                title: "Name and email are required.",
            });
            return;
        }

        try {
            setSaving(true);

            const request: UserUpdateDto = {
                id: userId,
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
            };

            await userService.updateUser(request);

            await Toast.fire({
                icon: "success",
                title: "User updated successfully!",
            });

            router.push("/admin/companies/view");

        } catch (error: any) {
            console.error("Update user error:", error);

            Toast.fire({
                icon: "error",
                title:
                    error?.response?.data?.message ||
                    "Unable to update user.",
            });

        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="edit-user-page">

            <div className="edit-user-header">

                <div className="edit-user-heading">

                    <button
                        type="button"
                        className="edit-user-back-btn"
                        onClick={() =>
                            router.push("/admin/companies/view")
                        }
                    >
                        <i className="bi bi-arrow-left"></i>
                    </button>

                    <div>
                        <h2>Edit User</h2>
                        <p>Update registered user information.</p>
                    </div>

                </div>

                <div className="edit-user-id">
                    <i className="bi bi-person-badge"></i>
                    User ID: <strong>{userId ?? "-"}</strong>
                </div>

            </div>

            <div className="edit-user-card">

                <div className="edit-user-card-header">

                    <div className="edit-user-card-icon">
                        <i className="bi bi-person-gear"></i>
                    </div>

                    <div>
                        <h4>User Information</h4>
                        <p>Modify the user's account details.</p>
                    </div>

                </div>

                {loading ? (
                    <div className="edit-user-loading">
                        <div className="spinner-border"></div>
                        <p>Loading user details...</p>
                    </div>
                ) : (

                    <form onSubmit={handleSubmit}>

                        <div className="edit-user-form-grid">

                            <div className="edit-user-form-group">
                                <label htmlFor="name">
                                    Full Name <span>*</span>
                                </label>

                                <div className="edit-user-input-wrapper">
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

                            <div className="edit-user-form-group">
                                <label htmlFor="email">
                                    Email Address <span>*</span>
                                </label>

                                <div className="edit-user-input-wrapper">
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

                            <div className="edit-user-form-group">
                                <label htmlFor="phone">
                                    Phone Number
                                </label>

                                <div className="edit-user-input-wrapper">
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

                        </div>

                        <div className="edit-user-info">
                            <i className="bi bi-info-circle"></i>
                            Update the details and click Update User to save changes.
                        </div>

                        <div className="edit-user-actions">

                            <button
                                type="button"
                                className="edit-user-cancel-btn"
                                onClick={() =>
                                    router.push("/admin/companies/view")
                                }
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="edit-user-submit-btn"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm"></span>
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check-circle"></i>
                                        Update User
                                    </>
                                )}
                            </button>

                        </div>

                    </form>

                )}

            </div>

        </section>
    );
}

export default EditUser;
