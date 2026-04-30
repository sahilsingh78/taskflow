import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const { data } = await api.get("/projects");
      setProjects(data);
    } catch (err) {
      setError("Failed to load projects");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async () => {
    if (!newProject.trim()) return;

    try {
      setCreating(true);

      await api.post("/projects", {
        name: newProject,
      });

      setNewProject("");
      fetchProjects();
    } catch (err) {
      console.error(err);
      setError("Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="center-text">Loading projects...</div>;

  return (
    <div className="page-container">

      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Projects</h1>
        <p className="page-subtitle">Manage your projects</p>
      </div>

      {/* Error */}
      {error && <p className="error-text">{error}</p>}

      {/* Create Project */}
      <div className="task-input-box">
        <input
          type="text"
          placeholder="Enter project name..."
          value={newProject}
          onChange={(e) => setNewProject(e.target.value)}
          className="form-control"
        />

        <button
          className="btn-primary"
          onClick={handleCreateProject}
          disabled={creating}
        >
          {creating ? "Creating..." : "Create Project"}
        </button>
      </div>

      {/* Projects Grid */}
      <div className="task-grid">
        {projects.length === 0 && (
          <p className="empty-text">No projects yet 🚀</p>
        )}

        {projects.map((project) => (
          <div
            key={project._id}
            className="project-card"
            onClick={() => navigate(`/projects/${project._id}`)}
            style={{
              cursor: "pointer",
              borderLeft: `5px solid ${project.color || "#6366f1"}`,
            }}
          >
            <h3>{project.name}</h3>

            {project.description && (
              <p className="task-meta">{project.description}</p>
            )}

            <p className={`task-status status-${project.status}`}>
              Status: <span>{project.status}</span>
            </p>

            {project.members && (
              <p className="task-meta">
                👥 {project.members.length} members
              </p>
            )}

            {project.dueDate && (
              <p className="task-meta">
                📅 {new Date(project.dueDate).toLocaleDateString()}
              </p>
            )}

            <div className="task-meta">Click to view →</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;