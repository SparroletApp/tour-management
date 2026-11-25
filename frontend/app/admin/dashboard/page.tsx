
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import companyService from "@/app/apiservice/companyservice";
import "./admin-dashboard.css";

function AdminDashboard() {
    const router = useRouter();

    const [totalCompanies, setTotalCompanies] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const response = await companyService.getTotalCompanies();
            setTotalCompanies(response);

        } catch (error: any) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text:
                    error?.response?.data?.message ||
                    "Failed to load dashboard data.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="admin-dashboard">
            <div className="super-dashboard-header">
                <div>
                    <span className="dashboard-welcome">
                        WELCOME BACK
                    </span>

                    <h2>Super Admin Dashboard</h2>

                    <p>
                        Manage and monitor your entire platform from one place.
                    </p>
                </div>

                <button
                    type="button"
                    className="dashboard-refresh-btn"
                    onClick={fetchDashboardData}
                    disabled={loading}
                >
                    <i className={`bi bi-arrow-clockwise ${loading ? "refresh-spin" : ""}`}></i>
                    Refresh
                </button>
            </div>

            <div className="super-dashboard-stats">

                <div className="super-stat-card companies-card">

                    <div className="super-stat-top">
                        <div className="super-stat-icon">
                            <i className="bi bi-buildings"></i>
                        </div>

                        <span className="super-stat-label">
                            COMPANIES
                        </span>
                    </div>

                    <div className="super-stat-info">
                        <h3>
                            {loading ? "..." : totalCompanies}
                        </h3>

                        <p>Total Registered Companies</p>
                    </div>

                    <div className="super-stat-footer">
                        <i className="bi bi-building-check"></i>
                        Platform Companies
                    </div>

                </div>

            </div>
            <div className="super-dashboard-section">

                <div className="super-section-header">
                    <div>
                        <h4>Quick Actions</h4>
                        <p>
                            Quickly access your management modules.
                        </p>
                    </div>
                </div>

                <div className="super-quick-actions">

                    <button
                        type="button"
                        className="super-action-card"
                        onClick={() => router.push("/super-admin/companies")}
                    >
                        <div className="super-action-icon">
                            <i className="bi bi-building-add"></i>
                        </div>

                        <div>
                            <h5>Manage Companies</h5>
                            <p>Add, edit and manage companies</p>
                        </div>

                        <i className="bi bi-arrow-up-right action-arrow"></i>
                    </button>

                    <button
                        type="button"
                        className="super-action-card"
                        onClick={() => router.push("/super-admin/users")}
                    >
                        <div className="super-action-icon users-icon">
                            <i className="bi bi-person-gear"></i>
                        </div>

                        <div>
                            <h5>Manage Users</h5>
                            <p>View and manage registered users</p>
                        </div>

                        <i className="bi bi-arrow-up-right action-arrow"></i>
                    </button>

                    <button
                        type="button"
                        className="super-action-card"
                        onClick={() => router.push("/super-admin/tours")}
                    >
                        <div className="super-action-icon tours-icon">
                            <i className="bi bi-truck"></i>
                        </div>

                        <div>
                            <h5>Manage Tours</h5>
                            <p>View and manage all tours</p>
                        </div>

                        <i className="bi bi-arrow-up-right action-arrow"></i>
                    </button>

                </div>
            </div>
            <div className="super-dashboard-bottom">

                <div className="super-info-card">
                    <div className="super-info-icon">
                        <i className="bi bi-shield-check"></i>
                    </div>

                    <div>
                        <h5>Platform Administration</h5>

                        <p>
                            Manage companies, users and platform-wide
                            operations from your Super Admin account.
                        </p>
                    </div>
                </div>

            </div>

        </section>
    );
}

export default AdminDashboard;
