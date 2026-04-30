import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

// This page is only visible to admin users (enforced in AppLayout nav + redirect below)
const TeamPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [updating, setUpdating] = useState(null); // tracks which user is being updated

  useEffect(() => {
    // Redirect non-admins who somehow land here
    if (!isAdmin) {
      navigate("/dashboard");
      return;
    }
    fetchUsers();
  }, [isAdmin, navigate]);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/users");
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdating(userId);
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update role");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter ? u.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  if (!isAdmin) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Team Management</div>
          <div className="page-subtitle">View and manage all registered users</div>
        </div>
        <span style={{ fontSize: 13, color: "var(--text-secondary)", background: "var(--bg-card)", border: "1px solid var(--border)", padding: "6px 14px", borderRadius: 8 }}>
          {users.length} total user{users.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Filters */}
      <div className="team-search" style={{ marginBottom: 20 }}>
        <input
          className="form-control"
          placeholder="🔍  Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 300 }}
        />
        <select
          className="filter-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-secondary)" }}>Loading users...</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No users found</h3>
          <p>Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="members-list">
          {filtered.map((u) => (
            <div className="member-row" key={u._id}>
              <div
                className="member-avatar-lg"
                style={{ background: u.role === "admin" ? "var(--accent)" : "var(--bg-hover)", color: u.role === "admin" ? "#fff" : "var(--text-secondary)" }}
              >
                {u.name?.[0]?.toUpperCase()}
              </div>
              <div className="member-info">
                <div className="member-name">
                  {u.name}
                  {u._id === user._id && (
                    <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 6 }}>(you)</span>
                  )}
                </div>
                <div className="member-email">{u.email}</div>
              </div>

              {/* Joined date */}
              <span style={{ fontSize: 12, color: "var(--text-muted)", marginRight: 8 }}>
                Joined {new Date(u.createdAt).toLocaleDateString()}
              </span>

              {/* Role badge or role changer */}
              {u._id === user._id ? (
                // Can't change your own role
                <span className={`badge badge-${u.role}`}>{u.role}</span>
              ) : (
                <div className="member-actions">
                  <select
                    className="filter-select"
                    style={{ fontSize: 12, padding: "5px 10px" }}
                    value={u.role}
                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    disabled={updating === u._id}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  {updating === u._id && (
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Saving...</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamPage;