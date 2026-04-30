import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const PROJECT_COLORS = ["#6c63ff", "#3ecf8e", "#5ba8f5", "#f7b731", "#e05c5c", "#c87cf0", "#e8753a"];

const CreateProjectModal = ({ onClose, onCreate }) => {
  const [form, setForm] = useState({ name: "", description: "", color: "#6c63ff", dueDate: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Project name is required");
    setLoading(true);
    try {
      const { data } = await api.post("/projects", form);
      onCreate(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">New Project</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Project Name *</label>
            <input className="form-control" placeholder="e.g. Website Redesign"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" placeholder="What is this project about?"
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input type="date" className="form-control"
              value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Color Tag</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
              {PROJECT_COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                  style={{
                    width: 28, height: 28, borderRadius: "50%", background: c, border: "none", cursor: "pointer",
                    outline: form.color === c ? `3px solid white` : "none",
                    transform: form.color === c ? "scale(1.2)" : "scale(1)",
                    transition: "all 0.15s"
                  }} />
              ))}
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/projects")
      .then((res) => setProjects(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = (newProject) => {
    setProjects((prev) => [newProject, ...prev]);
  };

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const getInitials = (name = "") => name[0]?.toUpperCase() || "?";

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Projects</div>
          <div className="page-subtitle">Manage and track all your projects</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input className="form-control" style={{ maxWidth: 320 }}
          placeholder="🔍  Search projects..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <p style={{ color: "var(--text-secondary)" }}>Loading projects...</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>{search ? "No projects found" : "No projects yet"}</h3>
          <p>{search ? "Try a different search term" : "Create your first project to get started"}</p>
          {!search && <button className="btn btn-primary" onClick={() => setShowModal(true)}>Create Project</button>}
        </div>
      ) : (
        <div className="projects-grid">
          {filtered.map((project) => (
            <div
              key={project._id}
              className="project-card"
              style={{ "--project-color": project.color }}
              onClick={() => navigate(`/projects/${project._id}`)}
            >
              <div className="project-card-header">
                <div className="project-name">{project.name}</div>
                <span className={`project-status-badge status-${project.status}`}>
                  {project.status.replace("-", " ")}
                </span>
              </div>
              <div className="project-desc">{project.description || "No description"}</div>
              <div className="project-footer">
                <div className="member-stack">
                  {project.members?.slice(0, 4).map((m) => (
                    <div key={m._id || m.user?._id} className="member-chip" title={m.user?.name}>
                      {getInitials(m.user?.name)}
                    </div>
                  ))}
                  {project.members?.length > 4 && (
                    <div className="member-chip">+{project.members.length - 4}</div>
                  )}
                </div>
                <span className="project-meta-text">
                  {project.dueDate ? `Due ${new Date(project.dueDate).toLocaleDateString()}` : `${project.members?.length || 0} member${project.members?.length !== 1 ? "s" : ""}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <CreateProjectModal onClose={() => setShowModal(false)} onCreate={handleCreate} />}
    </div>
  );
};

export default ProjectsPage;