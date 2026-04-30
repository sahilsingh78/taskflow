import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AppLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeSidebar = () => setSidebarOpen(false);

  const navLinks = [
    { to: "/dashboard", icon: "⊞", label: "Dashboard" },
    { to: "/projects", icon: "📁", label: "Projects" },
    { to: "/my-tasks", icon: "✓", label: "My Tasks" },
  ];

  const adminLinks = [
    { to: "/team", icon: "👥", label: "Team" },
  ];

  const getInitials = (name = "") =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const SidebarContent = () => (
    <>
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">⚡</div>
          <span className="sidebar-brand-name">TaskFlow</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <span className="nav-section-label">Main</span>
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <span className="nav-icon">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <span className="nav-section-label">Admin</span>
            {adminLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon">{link.icon}</span>
                {link.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-row">
          <div className="user-avatar">{getInitials(user?.name)}</div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">⇥</button>
        </div>
      </div>
    </>
  );

  return (
    <div className="app-shell">
      {/* Desktop sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={closeSidebar}
      />

      <div className="main-content">
        {/* Mobile topbar */}
        <div className="topbar">
          <div className="topbar-brand">
            <div className="topbar-icon">⚡</div>
            TaskFlow
          </div>
          <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
        </div>

        <div className="page-body">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;