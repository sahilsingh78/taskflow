import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const DashboardPage = () => {
  const { user, logout } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get("/tasks/dashboard");
        setStats(data);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <div className="center-text">Loading dashboard...</div>;
  if (!stats) return <div className="center-text">No data available</div>;

  return (
    <div className="page-container">

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {user?.name}</h1>
          <p>{user?.email}</p>
        </div>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      {/* Title */}
      <div className="page-header">
        <h2 className="page-title">Dashboard</h2>
        <p className="page-subtitle">Overview of your work</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-value">{stats.totalTasks}</div>
          <div className="stat-label">Total Tasks</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.doneTasks}</div>
          <div className="stat-label">Completed</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.inProgressTasks}</div>
          <div className="stat-label">In Progress</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.overdueTasks}</div>
          <div className="stat-label">Overdue</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.totalProjects}</div>
          <div className="stat-label">Projects</div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;