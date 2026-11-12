"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import dashboardService, {
    DashboardResponse,
} from "../apiservice/dashboardservice";

import "./dashboard.css";

function Dashboard() {

    const router = useRouter();

    const [dashboard, setDashboard] =
        useState<DashboardResponse | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await dashboardService.getDashboardDetails();

            setDashboard(response);

        } catch (error) {
            console.error("Dashboard loading error:", error);
            setError("Unable to load dashboard details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const tourCards = [
        {
            title: "Total Tour Packages",
            value: dashboard?.totalTourPackages ?? 0,
            icon: "bi-globe-americas",
            color: "blue",
            description: "All tour packages",
        },
        {
            title: "Published Packages",
            value: dashboard?.publishedTourPackages ?? 0,
            icon: "bi-check-circle",
            color: "green",
            description: "Active tour packages",
        },
        {
            title: "Draft Packages",
            value: dashboard?.draftTourPackages ?? 0,
            icon: "bi-file-earmark-text",
            color: "orange",
            description: "Unpublished packages",
        },
        {
            title: "Closed Packages",
            value: dashboard?.closedTourPackages ?? 0,
            icon: "bi-lock",
            color: "red",
            description: "Closed tour packages",
        },
    ];

    const formCards = [
        {
            title: "Total Forms",
            value: dashboard?.totalForms ?? 0,
            icon: "bi-ui-checks",
            color: "blue",
            description: "All created forms",
        },
        {
            title: "Published Forms",
            value: dashboard?.publishedForms ?? 0,
            icon: "bi-check-circle",
            color: "green",
            description: "Available forms",
        },
        {
            title: "Draft Forms",
            value: dashboard?.draftForms ?? 0,
            icon: "bi-file-earmark",
            color: "orange",
            description: "Forms in progress",
        },
        {
            title: "Closed Forms",
            value: dashboard?.closedForms ?? 0,
            icon: "bi-x-circle",
            color: "red",
            description: "Closed submissions",
        },
    ];

    const quickActions = [
        {
            title: "Create Tour",
            description: "Add a new tour package",
            icon: "bi-airplane",
            color: "tour",
            path: "/tours/create",
        },
        {
            title: "Create Form",
            description: "Build a new custom form",
            icon: "bi-file-earmark-plus",
            color: "form",
            path: "/forms/create",
        },
        {
            title: "View Tours",
            description: "Manage all tour packages",
            icon: "bi-globe",
            color: "view",
            path: "/tours",
        },
        {
            title: "View Forms",
            description: "Manage your existing forms",
            icon: "bi-ui-checks",
            color: "manage",
            path: "/forms",
        },
    ];

    const renderCards = (cards: typeof tourCards) => (
        <div className="dashboard-card-grid">
            {cards.map((card, index) => (
                <div className="dashboard-stat-card" key={index}>
                    <div className="dashboard-card-top">
                        <div className="dashboard-card-info">
                            <p>{card.title}</p>
                            <h2>
                                {loading ? (
                                    <span className="dashboard-skeleton"></span>
                                ) : (
                                    card.value
                                )}
                            </h2>
                        </div>
                        <div className={`dashboard-icon ${card.color}`}>
                            <i className={`bi ${card.icon}`}></i>
                        </div>
                    </div>
                    <div className="dashboard-card-bottom">
                        <span>{card.description}</span>
                        <i className="bi bi-arrow-up-right"></i>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h2>Dashboard</h2>
                    <p>
                        Welcome back! Here's an overview of your
                        tour management system.
                    </p>
                </div>

                <button
                    className="dashboard-refresh-btn"
                    onClick={fetchDashboard}
                    disabled={loading}
                >
                    <i className="bi bi-arrow-clockwise"></i>
                    {loading ? "Loading..." : "Refresh"}
                </button>
            </div>

            <section className="dashboard-section">
                <div className="dashboard-section-heading">
                    <div className="dashboard-section-icon">
                        <i className="bi bi-lightning-charge"></i>
                    </div>

                    <div>
                        <h3>Quick Actions</h3>
                        <p>Quickly access your frequently used features</p>
                    </div>
                </div>

                <div className="dashboard-quick-grid">
                    {quickActions.map((action, index) => (
                        <button
                            type="button"
                            className="dashboard-quick-card"
                            key={index}
                            onClick={() => router.push(action.path)}
                        >
                            <div className={`quick-action-icon ${action.color}`}>
                                <i className={`bi ${action.icon}`}></i>
                            </div>

                            <div className="quick-action-content">
                                <h4>{action.title}</h4>
                                <p>{action.description}</p>
                            </div>

                            <i className="bi bi-arrow-up-right quick-action-arrow"></i>
                        </button>
                    ))}
                </div>
            </section>

            {error && (
                <div className="dashboard-error">
                    <i className="bi bi-exclamation-circle"></i>
                    {error}
                    <button onClick={fetchDashboard}>Retry</button>
                </div>
            )}

            <section className="dashboard-section">
                <div className="dashboard-section-heading">
                    <div className="dashboard-section-icon">
                        <i className="bi bi-airplane"></i>
                    </div>

                    <div>
                        <h3>Tour Packages</h3>
                        <p>Overview of your tour packages</p>
                    </div>
                </div>

                {renderCards(tourCards)}
            </section>

            <section className="dashboard-section">
                <div className="dashboard-section-heading">
                    <div className="dashboard-section-icon form-icon">
                        <i className="bi bi-clipboard-check"></i>
                    </div>

                    <div>
                        <h3>Forms Management</h3>
                        <p>Overview of your forms and submissions</p>
                    </div>
                </div>

                {renderCards(formCards)}
            </section>

        </div>
    );
}

export default Dashboard;