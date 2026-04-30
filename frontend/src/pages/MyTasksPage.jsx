import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";

const ProjectDetailPage = () => {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);

  // fetch project + tasks
  const fetchData = async () => {
    try {
      const projectRes = await api.get(`/projects/${id}`);
      const tasksRes = await api.get(`/tasks?project=${id}`);

      setProject(projectRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error("Error loading project:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // create task
  const handleCreateTask = async () => {
    if (!newTask.trim()) return;

    try {
      await api.post("/tasks", {
        title: newTask,
        project: id,
      });

      setNewTask("");
      fetchData();
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  };

  // update status
  const updateStatus = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      fetchData();
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  if (loading) return <p>Loading project...</p>;
  if (!project) return <p>Project not found</p>;

  return (
    <div>
      {/* Project Info */}
      <div className="page-header">
        <h1>{project.name}</h1>
        <p>{project.description}</p>
      </div>

      {/* Create Task */}
      <div className="create-task">
        <input
          type="text"
          placeholder="New task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="form-control"
        />

        <button className="btn btn-primary" onClick={handleCreateTask}>
          Add Task
        </button>
      </div>

      {/* Task List */}
      <div className="task-list">
        {tasks.length === 0 && <p>No tasks yet</p>}

        {tasks.map((task) => (
          <div key={task._id} className="task-card">
            <div className="task-title">{task.title}</div>

            <div className="task-meta">
              Status: <strong>{task.status}</strong>
            </div>

            {/* Status Buttons */}
            <div className="task-actions">
              <button onClick={() => updateStatus(task._id, "todo")}>
                Todo
              </button>
              <button onClick={() => updateStatus(task._id, "in-progress")}>
                In Progress
              </button>
              <button onClick={() => updateStatus(task._id, "done")}>
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