import React, { useEffect, useState } from "react";
import api from "../utils/api";

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get("/tasks/dashboard");
        setStats(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <div className="center-text">Loading dashboard...</div>;
  if (error) return <div className="center-text">{error}</div>;
  if (!stats) return <div className="center-text">No data available</div>;

  return (
    <div className="page-container">

      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your work</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">

        <div className="stat-card hover">
          <div className="stat-value">{stats.totalTasks}</div>
          <div className="stat-label">Total Tasks</div>
        </div>

        <div className="stat-card hover done">
          <div className="stat-value">{stats.doneTasks}</div>
          <div className="stat-label">Completed</div>
        </div>

        <div className="stat-card hover progress">
          <div className="stat-value">{stats.inProgressTasks}</div>
          <div className="stat-label">In Progress</div>
        </div>

        <div className="stat-card hover overdue">
          <div className="stat-value">{stats.overdueTasks}</div>
          <div className="stat-label">Overdue</div>
        </div>

        <div className="stat-card hover">
          <div className="stat-value">{stats.totalProjects}</div>
          <div className="stat-label">Projects</div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;