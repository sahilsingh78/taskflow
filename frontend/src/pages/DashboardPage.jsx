import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, tasksRes] = await Promise.all([
          api.get("/tasks/dashboard"),
          api.get("/tasks/my"),
        ]);
        setStats(statsRes.data);
        // Show only the 5 most recent assigned tasks
        setRecentTasks(tasksRes.data.slice(0, 5));
      } catch (err) {
        console.error("Dashboard fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const statCards = [
    { icon: "📋", label: "Total Tasks", value: stats?.totalTasks ?? 0, color: "var(--accent-light)" },
    { icon: "✅", label: "Completed", value: stats?.doneTasks ?? 0, color: "var(--success)" },
    { icon: "🔄", label: "In Progress", value: stats?.inProgressTasks ?? 0, color: "var(--info)" },
    { icon: "⚠️", label: "Overdue", value: stats?.overdueTasks ?? 0, color: "var(--danger)" },
    { icon: "📁", label: "Projects", value: stats?.totalProjects ?? 0, color: "var(--warning)" },
  ];

  const getStatusClass = (status) => {
    const map = { todo: "badge-todo", "in-progress": "badge-in-progress", "in-review": "badge-in-review", done: "badge-done" };
    return map[status] || "badge-todo";
  };

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div><div className="page-title">Dashboard</div><div className="page-subtitle">Overview of your work</div></div>
        </div>
        <p style={{ color: "var(--text-secondary)" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Welcome back, {user?.name?.split(" ")[0]} 👋</div>
          <div className="page-subtitle">Here's what's going on with your work</div>
        </div>
        <Link to="/projects" className="btn btn-primary">+ New Project</Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {statCards.map((card) => (
          <div className="stat-card" key={card.label}>
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-value" style={{ color: card.color }}>{card.value}</div>
            <div className="stat-label">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Recent tasks assigned to user */}
      <div style={{ marginTop: 8 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>My Recent Tasks</div>
          <Link to="/my-tasks" style={{ fontSize: 13, color: "var(--accent-light)" }}>View all →</Link>
        </div>

        {recentTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🚀</div>
            <h3>No tasks yet</h3>
            <p>Tasks assigned to you will show up here</p>
            <Link to="/projects" className="btn btn-primary">Go to Projects</Link>
          </div>
        ) : (
          <div className="task-list">
            {recentTasks.map((task) => {
              const isDue = task.dueDate && new Date() > new Date(task.dueDate) && task.status !== "done";
              return (
                <div className="task-item" key={task._id}>
                  <div className={`priority-bar priority-${task.priority}`} />
                  <div className="task-main">
                    <div className={`task-title ${task.status === "done" ? "done" : ""}`}>{task.title}</div>
                    <div className="task-meta">
                      <span>{task.project?.name}</span>
                      {task.dueDate && (
                        <span className={isDue ? "overdue-text" : ""}>
                          {isDue ? "⚠ Overdue" : `Due ${new Date(task.dueDate).toLocaleDateString()}`}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`badge ${getStatusClass(task.status)}`}>
                    {task.status.replace("-", " ")}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;