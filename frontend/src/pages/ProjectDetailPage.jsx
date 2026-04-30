import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";

const ProjectDetailPage = () => {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);

  const [newTask, setNewTask] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // 🔥 FETCH DATA
  const fetchData = async () => {
    try {
      const [projectRes, tasksRes, membersRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?project=${id}`),
        api.get(`/projects/${id}/members`)
      ]);

      setProject(projectRes.data);
      setTasks(tasksRes.data);
      setMembers(membersRes.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load project data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // 🔥 CREATE TASK
  const handleCreateTask = async () => {
    if (!newTask.trim()) return;

    try {
      setCreating(true);

      await api.post("/tasks", {
        title: newTask,
        project: id,
        assignedTo,
        dueDate,
        priority,
      });

      setNewTask("");
      setAssignedTo("");
      setDueDate("");
      setPriority("medium");

      fetchData();
    } catch (err) {
      console.error(err);
      setError("Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  // 🔥 UPDATE STATUS
  const updateStatus = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      fetchData();
    } catch (err) {
      console.error(err);
      setError("Failed to update task");
    }
  };

  // 🔥 UI STATES
  if (loading) return <div className="center-text">Loading project...</div>;
  if (!project) return <div className="center-text">Project not found</div>;

  return (
    <div className="page-container">

      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">{project.name}</h1>
        <p className="page-subtitle">{project.description}</p>
      </div>

      {/* Error */}
      {error && <p className="error-text">{error}</p>}

      {/* CREATE TASK */}
      <div className="task-input-box">

        <input
          type="text"
          placeholder="Task title..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="form-control"
        />

        <select
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          className="form-control"
        >
          <option value="">Assign to</option>
          {members.map((m) => (
            <option key={m.user._id} value={m.user._id}>
              {m.user.name} ({m.role})
            </option>
          ))}
        </select>

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="form-control"
        />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="form-control"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>

        <button
          className="btn-primary"
          onClick={handleCreateTask}
          disabled={!newTask.trim() || creating}
        >
          {creating ? "Adding..." : "Add Task"}
        </button>
      </div>

      {/* TASK GRID */}
      <div className="task-grid">

        {tasks.length === 0 && (
          <p className="empty-text">No tasks yet 🚀</p>
        )}

        {tasks.map((task) => (
          <div key={task._id} className="task-card">

            <h3>{task.title}</h3>

            {task.assignedTo && (
              <p className="task-meta">
                👤 {task.assignedTo.name}
              </p>
            )}

            <p className={`task-priority ${task.priority}`}>
              ⚡ {task.priority}
            </p>

            {task.dueDate && (
              <p className="task-meta">
                📅 {new Date(task.dueDate).toLocaleDateString()}
              </p>
            )}

            {task.isOverdue && (
              <p className="overdue-badge">⚠ Overdue</p>
            )}

            <p className={`task-status status-${task.status}`}>
              Status: <span>{task.status}</span>
            </p>

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

export default ProjectDetailPage;