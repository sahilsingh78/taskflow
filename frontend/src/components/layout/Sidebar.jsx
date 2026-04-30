import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <aside className="sidebar">
      <h2 className="logo">TaskFlow</h2>

      <nav className="nav-links">
        <Link to="/dashboard" className={isActive("/dashboard")}>
          Dashboard
        </Link>

        <Link to="/projects" className={isActive("/projects")}>
          Projects
        </Link>

        <Link to="/my-tasks" className={isActive("/my-tasks")}>
          My Tasks
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;