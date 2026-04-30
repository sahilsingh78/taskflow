import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const MyTasksPage = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    api.get("/tasks/my")
      .then((res) => setTasks(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (task, newStatus) => {
    try {
      const { data } = await api.put(`/tasks/${task._id}`, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t._id === data._id ? data : t)));
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusClass = (s) => ({ todo: "badge-todo", "in-progress": "badge-in-progress", "in-review": "badge-in-review", done: "badge-done" })[s] || "badge-todo";

  const filtered = statusFilter ? tasks.filter((t) => t.status === statusFilter) : tasks;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">My Tasks</div>
          <div className="page-subtitle">Tasks assigned to you across all projects</div>
        </div>
      </div>

      <div className="task-toolbar" style={{ marginBottom: 18 }}>
        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="in-review">In Review</option>
          <option value="done">Done</option>
        </select>
        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{filtered.length} task{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-secondary)" }}>Loading tasks...</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🚀</div>
          <h3>No tasks assigned to you</h3>
          <p>When someone assigns a task to you, it will appear here</p>
          <button className="btn btn-primary" onClick={() => navigate("/projects")}>Browse Projects</button>
        </div>
      ) : (
        <div className="task-list">
          {filtered.map((task) => {
            const isOverdue = task.dueDate && new Date() > new Date(task.dueDate) && task.status !== "done";
            return (
              <div className="task-item" key={task._id}>
                <div className={`priority-bar priority-${task.priority}`} />
                <div className="task-main">
                  <div className={`task-title ${task.status === "done" ? "done" : ""}`}>{task.title}</div>
                  <div className="task-meta">
                    <span
                      style={{ color: "var(--accent-light)", cursor: "pointer" }}
                      onClick={() => navigate(`/projects/${task.project?._id}`)}
                    >
                      📁 {task.project?.name}
                    </span>
                    {task.dueDate && (
                      <span className={isOverdue ? "overdue-text" : ""}>
                        {isOverdue ? "⚠ Overdue" : `📅 ${new Date(task.dueDate).toLocaleDateString()}`}
                      </span>
                    )}
                    <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                  </div>
                </div>

                <select
                  className="filter-select"
                  style={{ padding: "5px 8px", fontSize: 12 }}
                  value={task.status}
                  onChange={(e) => handleStatusChange(task, e.target.value)}
                >
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="in-review">In Review</option>
                  <option value="done">Done</option>
                </select>

                <span className={`badge ${getStatusClass(task.status)}`}>{task.status.replace("-", " ")}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyTasksPage;