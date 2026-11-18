
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

import "./user-lists.css";
import userService, { UserResponseDto } from "../apiservice/userservice";
import { useRouter } from "next/navigation";

function UserLists() {
    const [users, setUsers] = useState<UserResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const router = useRouter();
    const getCompanyId = () => {
        if (typeof window === "undefined") return null;

        const value = sessionStorage.getItem("company_id");
        if (!value) return null;

        const id = Number(value);
        return Number.isInteger(id) && id > 0 ? id : null;
    };

    const handleEdit = (id: number) => {
        localStorage.setItem("edit_user_id", String(id));
        router.push("/user-lists/edit");
    };

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);

            const companyId = getCompanyId();

            if (!companyId) {
                setUsers([]);
                Swal.fire({
                    icon: "warning",
                    title: "Company Not Found",
                    text: "Company ID is missing from session storage.",
                });
                return;
            }

            const response = await userService.getUsersByCompany({
                id: companyId,
            });

            setUsers(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Error fetching users:", error);

            Swal.fire({
                icon: "error",
                title: "Failed",
                text: "Unable to load users. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const searchText = search.toLowerCase();

            const matchesSearch =
                user.name?.toLowerCase().includes(searchText) ||
                user.email?.toLowerCase().includes(searchText) ||
                user.phone?.toLowerCase().includes(searchText);

            const matchesRole =
                roleFilter === "ALL" ||
                user.role?.toUpperCase() === roleFilter;

            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "ACTIVE" && user.status) ||
                (statusFilter === "INACTIVE" && !user.status);

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, search, roleFilter, statusFilter]);

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Delete User?",
            text: "Are you sure you want to delete this user?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Yes, Delete",
        });

        if (!result.isConfirmed) return;

        try {
            await userService.deleteUser({ id });

            setUsers((prev) => prev.filter((user) => user.id !== id));

            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "success",
                title: "User deleted successfully",
                showConfirmButton: false,
                timer: 2000,
            });
        } catch (error) {
            console.error("Delete error:", error);

            Swal.fire({
                icon: "error",
                title: "Delete Failed",
                text: "Unable to delete user.",
            });
        }
    };

    const activeCount = users.filter((user) => user.status).length;
    const inactiveCount = users.length - activeCount;

    return (
        <div className="user-lists-page">

            <div className="user-lists-header">
                <div>
                    <h2>User Management</h2>
                    <p>Manage users registered under your company.</p>
                </div>

                <div className="user-header-actions">
                    <button
                        className="user-add-btn"
                        onClick={() => router.push("/user-lists/add")}
                    >
                        <i className="bi bi-plus-lg"></i>
                        Add User
                    </button>

                    <button
                        className="user-refresh-btn"
                        onClick={fetchUsers}
                        disabled={loading}
                    >
                        <i className="bi bi-arrow-clockwise"></i>
                        Refresh
                    </button>
                </div>
            </div>

            <div className="user-stats">
                <div className="user-stat-card">
                    <div className="user-stat-icon total">
                        <i className="bi bi-people"></i>
                    </div>
                    <div>
                        <span>Total Users</span>
                        <h3>{users.length}</h3>
                    </div>
                </div>

                <div className="user-stat-card">
                    <div className="user-stat-icon active">
                        <i className="bi bi-person-check"></i>
                    </div>
                    <div>
                        <span>Active Users</span>
                        <h3>{activeCount}</h3>
                    </div>
                </div>

                <div className="user-stat-card">
                    <div className="user-stat-icon inactive">
                        <i className="bi bi-person-x"></i>
                    </div>
                    <div>
                        <span>Inactive Users</span>
                        <h3>{inactiveCount}</h3>
                    </div>
                </div>
            </div>

            <div className="user-list-container">

                <div className="user-list-toolbar">
                    <div className="user-search">
                        <i className="bi bi-search"></i>
                        <input
                            type="text"
                            placeholder="Search name, email or phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="ALL">All Roles</option>
                        {[...new Set(users.map((u) => u.role?.toUpperCase()).filter(Boolean))].map((role) => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                </div>

                <div className="user-table-heading">
                    <div>
                        <h3>Company Users</h3>
                        <span>{filteredUsers.length} users found</span>
                    </div>
                </div>

                <div className="user-table-wrapper">
                    <table className="user-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>User</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Created Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="user-empty">
                                        <div className="user-loader"></div>
                                        Loading users...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="user-empty">
                                        <i className="bi bi-people"></i>
                                        <p>No users found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user, index) => (
                                    <tr key={user.id}>
                                        <td>{index + 1}</td>

                                        <td>
                                            <div className="user-name-cell">
                                                <div className="user-avatar">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <strong>{user.name}</strong>
                                            </div>
                                        </td>

                                        <td>{user.email}</td>
                                        <td>{user.phone || "-"}</td>

                                        <td>
                                            <span className="user-role">
                                                {user.role}
                                            </span>
                                        </td>

                                        <td>
                                            <span className={`user-status ${user.status ? "status-active" : "status-inactive"}`}>
                                                {user.status ? "Active" : "Inactive"}
                                            </span>
                                        </td>

                                        <td>
                                            {user.createdAt
                                                ? new Date(user.createdAt).toLocaleDateString("en-IN")
                                                : "-"}
                                        </td>

                                        <td>
                                            <div className="user-action-buttons">
                                                <button
                                                    className="user-edit-btn"
                                                    title="Edit User"
                                                    onClick={() => handleEdit(user.id)}
                                                >
                                                    <i className="bi bi-pencil-square"></i>
                                                </button>

                                                <button
                                                    className="user-delete-btn"
                                                    title="Delete User"
                                                    onClick={() => handleDelete(user.id)}
                                                >
                                                    <i className="bi bi-trash3"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default UserLists;
