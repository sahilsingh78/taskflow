import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const { data } = await api.get("/projects");
      setProjects(data);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;

    try {
      await api.post("/projects", { name });
      setName("");
      fetchProjects();
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  };

  if (loading) return <p>Loading projects...</p>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Projects</h1>
      </div>

      {/* Create Project */}
      <div className="create-project">
        <input
          type="text"
          placeholder="Enter project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="form-control"
        />

        <button className="btn btn-primary" onClick={handleCreate}>
          Create
        </button>
      </div>

      {/* Project List */}
      <div className="projects-grid">
        {projects.length === 0 && <p>No projects yet</p>}

        {projects.map((project) => (
          <div
            key={project._id}
            className="project-card"
            onClick={() => navigate(`/projects/${project._id}`)}
          >
            <div className="project-name">{project.name}</div>

            <div className="project-meta">
              {project.members?.length || 0} members
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;