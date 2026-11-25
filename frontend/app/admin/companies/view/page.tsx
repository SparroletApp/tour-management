
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

import "./company-view.css";

import userService, {
    CompanyIdDto,
    UserIdDto,
    UserResponseDto,
} from "@/app/apiservice/userservice";

function CompanyView() {
    const router = useRouter();

    const [users, setUsers] = useState<UserResponseDto[]>([]);
    const [companyId, setCompanyId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const storedCompanyId = localStorage.getItem("company_view_id");

        if (
            !storedCompanyId ||
            !Number.isInteger(Number(storedCompanyId)) ||
            Number(storedCompanyId) <= 0
        ) {
            setLoading(false);

            Swal.fire({
                icon: "error",
                title: "Company Not Found",
                text: "Invalid company ID. Please select a company.",
                confirmButtonColor: "#064e45",
            }).then(() => {
                router.push("/admin/companies");
            });

            return;
        }

        const id = Number(storedCompanyId);

        setCompanyId(id);

        fetchCompanyUsers(id);
    }, []);

    const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    });

    const handleEdit = (user: UserResponseDto) => {
        localStorage.setItem("edit_user_id", String(user.id));
        router.push("/user/edit");
    };

    const handleDelete = async (user: UserResponseDto) => {
        const result = await Swal.fire({
            title: "Delete User?",
            text: `Are you sure you want to delete ${user.name}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#dc3545",
            cancelButtonColor: "#6c757d",
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;

        try {
            const request: UserIdDto = {
                id: user.id,
            };

            await userService.deleteUser(request);

            setUsers((prev) =>
                prev.filter((item) => item.id !== user.id)
            );

            Toast.fire({
                icon: "success",
                title: "User deleted successfully!",
            });

        } catch (error: any) {
            console.error("Delete user error:", error);

            Toast.fire({
                icon: "error",
                title:
                    error?.response?.data?.message ||
                    "Unable to delete user.",
            });
        }
    };

    const fetchCompanyUsers = async (id: number) => {
        try {
            setLoading(true);

            const request: CompanyIdDto = {
                id: id,
            };

            console.log("Fetching users for Company ID:", id);
            console.log("Request Body:", request);

            const response = await userService.getUsersByCompany(request);

            setUsers(Array.isArray(response) ? response : []);

        } catch (error: any) {
            console.error("Error fetching company users:", error);

            Swal.fire({
                icon: "error",
                title: "Failed to Load Users",
                text:
                    error?.response?.data?.message ||
                    (typeof error?.response?.data === "string"
                        ? error.response.data
                        : "Unable to fetch company users."),
                confirmButtonColor: "#064e45",
            });

            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter((user) =>
            [
                user.name || "",
                user.email || "",
                user.phone || "",
                user.role || "",
            ].some((value) =>
                value.toLowerCase().includes(search.toLowerCase())
            )
        );
    }, [users, search]);


    return (
        <section className="company-view-page">

            <div className="company-view-header">

                <div className="company-view-heading">
                    <button
                        className="company-back-btn"
                        onClick={() => router.push("/admin/companies")}
                    >
                        <i className="bi bi-arrow-left"></i>
                    </button>

                    <div>
                        <h2>Company Users</h2>
                        <p>
                            Manage users registered under this company.
                        </p>
                    </div>
                </div>

                <div className="company-view-header-actions">

                    <div className="company-view-id">
                        <i className="bi bi-buildings"></i>
                        Company ID: <strong>{companyId ?? "-"}</strong>
                    </div>

                    <button
                        className="company-add-user-btn"
                        onClick={() => router.push("/user/create")}
                    >
                        <i className="bi bi-person-plus-fill"></i>
                        Add User
                    </button>

                </div>

            </div>
            <div className="company-user-stats">

                <div className="company-user-stat-card">
                    <div className="company-user-stat-icon total">
                        <i className="bi bi-people"></i>
                    </div>

                    <div>
                        <span>Total Users</span>
                        <h3>{users.length}</h3>
                    </div>
                </div>


            </div>

            <div className="company-users-table-card">

                <div className="company-users-table-header">

                    <div>
                        <h5>Registered Users</h5>

                        <span>
                            Users belonging to company #{companyId ?? "-"}
                        </span>
                    </div>

                    <div className="company-users-search">
                        <i className="bi bi-search"></i>

                        <input
                            type="text"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                </div>

                <div className="table-responsive">

                    <table className="table company-users-table">

                        <thead>
                            <tr>
                                <th>#</th>
                                <th>User</th>
                                <th>Email</th>
                                <th>Password</th>
                                <th>Phone</th>

                                <th>Role</th>

                                <th>Created Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>

                            {loading ? (

                                <tr>
                                    <td colSpan={7}>
                                        <div className="company-users-loading">
                                            <div className="spinner-border"></div>
                                            <p>Loading company users...</p>
                                        </div>
                                    </td>
                                </tr>

                            ) : filteredUsers.length > 0 ? (

                                filteredUsers.map((user, index) => (

                                    <tr key={user.id}>

                                        <td>{index + 1}</td>

                                        <td>
                                            <div className="company-user-name">

                                                <div className="company-user-avatar">
                                                    {user.name
                                                        ?.charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <strong>{user.name}</strong>

                                            </div>
                                        </td>

                                        <td>{user.email}</td>
                                        <td>{user.password}</td>

                                        <td>{user.phone || "-"}</td>

                                        <td>
                                            <span className="company-user-role">
                                                {user.role}
                                            </span>
                                        </td>

                                       

                                        <td>
                                            {user.createdAt
                                                ? new Date(
                                                    user.createdAt
                                                ).toLocaleDateString()
                                                : "-"}
                                        </td>
                                        <td>
                                            <div className="company-user-actions">
                                                <button
                                                    type="button"
                                                    className="company-user-edit-btn"
                                                    title="Edit User"
                                                    onClick={() => handleEdit(user)}
                                                >
                                                    <i className="bi bi-pencil-square"></i>
                                                </button>
                                                <button
                                                    type="button"
                                                    className="company-user-delete-btn"
                                                    title="Delete User"
                                                    onClick={() => handleDelete(user)}
                                                >
                                                    <i className="bi bi-trash3-fill"></i>
                                                </button>

                                            </div>
                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr>
                                    <td colSpan={7}>
                                        <div className="company-users-empty">

                                            <i className="bi bi-people"></i>

                                            <h5>
                                                {search
                                                    ? "No Users Found"
                                                    : "No Users Registered"}
                                            </h5>

                                            <p>
                                                {search
                                                    ? "No users match your search."
                                                    : "There are no users registered under this company yet."}
                                            </p>

                                        </div>
                                    </td>
                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

                <div className="company-users-footer">
                    Showing {filteredUsers.length} of {users.length} users
                </div>

            </div>

        </section>
    );
}

export default CompanyView;
