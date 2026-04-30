import React, { useEffect, useState } from "react";
import api from "../utils/api";

const MyTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const fetchTasks = async () => {
    try {
      const { data } = await api.get("/tasks/my");
      setTasks(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const updateStatus = async (taskId, status) => {
    try {
      setUpdatingId(taskId);

      await api.put(`/tasks/${taskId}`, { status });

      // 🔥 Optimistic update (no full reload needed)
      setTasks((prev) =>
        prev.map((t) =>
          t._id === taskId ? { ...t, status } : t
        )
      );
    } catch (err) {
      console.error(err);
      setError("Failed to update task");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="center-text">Loading tasks...</div>;

  return (
    <div className="page-container">

      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">My Tasks</h1>
        <p className="page-subtitle">Tasks assigned to you</p>
      </div>

      {/* Error */}
      {error && <p className="error-text">{error}</p>}

      {/* Task Grid */}
      <div className="task-grid">
        {tasks.length === 0 && (
          <p className="empty-text">No tasks assigned 🚀</p>
        )}

        {tasks.map((task) => (
          <div key={task._id} className="task-card">

            {/* Title */}
            <h3>{task.title}</h3>

            {/* Project */}
            {task.project && (
              <p className="task-meta">
                📁 {task.project.name}
              </p>
            )}

            {/* Assigned */}
            {task.assignedTo && (
              <p className="task-meta">
                👤 {task.assignedTo.name}
              </p>
            )}

            {/* Priority */}
            <p className={`task-priority ${task.priority}`}>
              ⚡ {task.priority}
            </p>

            {/* Due Date */}
            {task.dueDate && (
              <p className="task-meta">
                📅 {new Date(task.dueDate).toLocaleDateString()}
              </p>
            )}

            {/* Status */}
            <p className={`task-status status-${task.status}`}>
              Status: <span>{task.status}</span>
            </p>

            {/* Overdue */}
            {task.isOverdue && (
              <p className="overdue-badge">⚠ Overdue</p>
            )}

            {/* Actions */}
            <div className="task-actions">
              <button
                className="btn-status"
                disabled={updatingId === task._id}
                onClick={() => updateStatus(task._id, "todo")}
              >
                Todo
              </button>

              <button
                className="btn-status"
                disabled={updatingId === task._id}
                onClick={() => updateStatus(task._id, "in-progress")}
              >
                In Progress
              </button>

              <button
                className="btn-status done"
                disabled={updatingId === task._id}
                onClick={() => updateStatus(task._id, "done")}
              >
                {updatingId === task._id ? "Updating..." : "Done"}
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default MyTasksPage;