import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

// ── Task Modal ──────────────────────────────────────
const TaskModal = ({ task, members, projectId, onClose, onSave }) => {
  const { user } = useAuth();
  const isEditing = !!task;

  const [form, setForm] = useState({
    title: task?.title || "",
    description: task?.description || "",
    assignedTo: task?.assignedTo?._id || task?.assignedTo || "",
    priority: task?.priority || "medium",
    status: task?.status || "todo",
    dueDate: task?.dueDate ? task.dueDate.split("T")[0] : "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError("Title is required");
    setLoading(true);
    try {
      let saved;
      if (isEditing) {
        const { data } = await api.put(`/tasks/${task._id}`, form);
        saved = data;
      } else {
        const { data } = await api.post("/tasks", { ...form, project: projectId });
        saved = data;
      }
      onSave(saved, isEditing);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{isEditing ? "Edit Task" : "New Task"}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input className="form-control" placeholder="What needs to be done?"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" placeholder="Add more context..."
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label>Priority</label>
              <select className="form-control" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select className="form-control" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="in-review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Assign To</label>
            <select className="form-control" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.user?._id} value={m.user?._id}>{m.user?.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input type="date" className="form-control"
              value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : isEditing ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Add Member Modal ──────────────────────────────────────
const AddMemberModal = ({ projectId, onClose, onAdd }) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return setError("Email is required");
    setLoading(true);
    try {
      const { data } = await api.post(`/projects/${projectId}/members`, { email, role });
      onAdd(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Add Member</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Member Email *</label>
            <input type="email" className="form-control" placeholder="member@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
          </div>
          <div className="form-group">
            <label>Project Role</label>
            <select className="form-control" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main Component ──────────────────────────────────────
const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tasks");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  // Modal states
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showAddMember, setShowAddMember] = useState(false);

  const fetchProject = useCallback(async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?project=${id}`),
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error("Failed to load project:", err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchProject(); }, [fetchProject]);

  // Check if current user is a project admin
  const myMembership = project?.members?.find((m) => m.user?._id === user?._id);
  const isProjectAdmin = myMembership?.role === "admin" || project?.owner?._id === user?._id;

  const handleTaskSave = (savedTask, isEdit) => {
    if (isEdit) {
      setTasks((prev) => prev.map((t) => (t._id === savedTask._id ? savedTask : t)));
    } else {
      setTasks((prev) => [savedTask, ...prev]);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete task");
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Remove this member?")) return;
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      setProject((prev) => ({
        ...prev,
        members: prev.members.filter((m) => m.user?._id !== userId),
      }));
    } catch (err) {
      alert(err.response?.data?.message || "Could not remove member");
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      const { data } = await api.put(`/tasks/${task._id}`, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t._id === data._id ? data : t)));
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusClass = (s) => ({ todo: "badge-todo", "in-progress": "badge-in-progress", "in-review": "badge-in-review", done: "badge-done" })[s] || "badge-todo";

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (priorityFilter && t.priority !== priorityFilter) return false;
    return true;
  });

  if (loading) return <div style={{ color: "var(--text-secondary)", padding: 40 }}>Loading project...</div>;
  if (!project) return <div style={{ color: "var(--danger)", padding: 40 }}>Project not found</div>;

  return (
    <div>
      {/* Header */}
      <div className="project-detail-header">
        <button className="back-btn" onClick={() => navigate("/projects")}>←</button>
        <div className="project-color-dot" style={{ background: project.color }} />
        <div style={{ flex: 1 }}>
          <div className="page-title">{project.name}</div>
          {project.description && (
            <div className="page-subtitle">{project.description}</div>
          )}
        </div>
        {isProjectAdmin && (
          <span style={{ fontSize: 12, background: "var(--accent-dim)", color: "var(--accent-light)", padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>
            Admin
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn ${activeTab === "tasks" ? "active" : ""}`} onClick={() => setActiveTab("tasks")}>
          Tasks ({tasks.length})
        </button>
        <button className={`tab-btn ${activeTab === "members" ? "active" : ""}`} onClick={() => setActiveTab("members")}>
          Members ({project.members?.length || 0})
        </button>
      </div>

      {/* Tasks Tab */}
      {activeTab === "tasks" && (
        <div>
          <div className="task-toolbar">
            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="in-review">In Review</option>
              <option value="done">Done</option>
            </select>
            <select className="filter-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <button className="btn btn-primary btn-sm" onClick={() => { setEditingTask(null); setShowTaskModal(true); }}>
              + Add Task
            </button>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✅</div>
              <h3>No tasks yet</h3>
              <p>Add tasks to start tracking your project progress</p>
              <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>Add First Task</button>
            </div>
          ) : (
            <div className="task-list">
              {filteredTasks.map((task) => {
                const isOverdue = task.dueDate && new Date() > new Date(task.dueDate) && task.status !== "done";
                return (
                  <div className="task-item" key={task._id}>
                    <div className={`priority-bar priority-${task.priority}`} />
                    <div className="task-main">
                      <div className={`task-title ${task.status === "done" ? "done" : ""}`}>{task.title}</div>
                      <div className="task-meta">
                        {task.assignedTo && <span>👤 {task.assignedTo.name}</span>}
                        {task.dueDate && (
                          <span className={isOverdue ? "overdue-text" : ""}>
                            {isOverdue ? "⚠ Overdue" : `📅 ${new Date(task.dueDate).toLocaleDateString()}`}
                          </span>
                        )}
                        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                      </div>
                    </div>

                    {/* Quick status changer */}
                    <select
                      className="filter-select"
                      style={{ padding: "5px 8px", fontSize: 12 }}
                      value={task.status}
                      onChange={(e) => handleStatusChange(task, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="todo">Todo</option>
                      <option value="in-progress">In Progress</option>
                      <option value="in-review">In Review</option>
                      <option value="done">Done</option>
                    </select>

                    <span className={`badge ${getStatusClass(task.status)}`}>{task.status.replace("-", " ")}</span>

                    <button className="btn btn-ghost btn-sm" title="Edit" onClick={() => { setEditingTask(task); setShowTaskModal(true); }}>✏️</button>
                    {(task.createdBy?._id === user?._id || isProjectAdmin) && (
                      <button className="btn btn-ghost btn-sm" title="Delete" onClick={() => handleDeleteTask(task._id)}>🗑️</button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Members Tab */}
      {activeTab === "members" && (
        <div>
          {isProjectAdmin && (
            <div style={{ marginBottom: 16 }}>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAddMember(true)}>
                + Add Member
              </button>
            </div>
          )}
          <div className="members-list">
            {project.members?.map((m) => (
              <div className="member-row" key={m._id || m.user?._id}>
                <div className="member-avatar-lg">{m.user?.name?.[0]?.toUpperCase()}</div>
                <div className="member-info">
                  <div className="member-name">{m.user?.name}</div>
                  <div className="member-email">{m.user?.email}</div>
                </div>
                <span className={`badge badge-${m.role}`}>{m.role}</span>
                {isProjectAdmin && m.user?._id !== user?._id && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleRemoveMember(m.user?._id)}>
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showTaskModal && (
        <TaskModal
          task={editingTask}
          members={project.members || []}
          projectId={id}
          onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
          onSave={handleTaskSave}
        />
      )}
      {showAddMember && (
        <AddMemberModal
          projectId={id}
          onClose={() => setShowAddMember(false)}
          onAdd={(updatedProject) => setProject(updatedProject)}
        />
      )}
    </div>
  );
};

export default ProjectDetailPage;