import React, { useEffect, useState } from "react";
import api from "../utils/api";

const MyTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      // 🔥 better endpoint (you already built this)
      const { data } = await api.get("/tasks/my");
      setTasks(data);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const updateStatus = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      fetchTasks();
    } catch (err) {
      console.error("Failed to update task:", err);
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
                onClick={() => updateStatus(task._id, "todo")}
              >
                Todo
              </button>

              <button
                className="btn-status"
                onClick={() => updateStatus(task._id, "in-progress")}
              >
                In Progress
              </button>

              <button
                className="btn-status done"
                onClick={() => updateStatus(task._id, "done")}
              >
                Done
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default MyTasksPage;