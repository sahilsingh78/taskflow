import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const TeamPage = () => {
  const { user } = useAuth();

  const [members, setMembers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchMembers = async () => {
    try {
      const { data } = await api.get("/users");
      setMembers(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load team");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // 🔍 filter logic
  useEffect(() => {
    let data = members;

    if (search.trim()) {
      data = data.filter(
        (m) =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (roleFilter !== "all") {
      data = data.filter((m) => m.role === roleFilter);
    }

    setFiltered(data);
  }, [search, roleFilter, members]);

  // 🔥 role change (admin only)
  const updateRole = async (id, role) => {
    try {
      setUpdatingId(id);
      await api.put(`/users/${id}/role`, { role });

      setMembers((prev) =>
        prev.map((m) => (m._id === id ? { ...m, role } : m))
      );
    } catch (err) {
      console.error(err);
      setError("Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="center-text">Loading team...</div>;

  return (
    <div className="page-container">

      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Team</h1>
        <p className="page-subtitle">Manage your team members</p>
      </div>

      {/* Error */}
      {error && <p className="error-text">{error}</p>}

      {/* Filters */}
      <div className="task-input-box">

        <input
          type="text"
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-control"
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="form-control"
        >
          <option value="all">All</option>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>

      </div>

      {/* Grid */}
      <div className="task-grid">

        {filtered.length === 0 && (
          <p className="empty-text">No members found</p>
        )}

        {filtered.map((m) => (
          <div key={m._id} className="task-card">

            <h3>{m.name}</h3>
            <p className="task-meta">{m.email}</p>

            <p className="task-meta">
              Role: <strong>{m.role}</strong>
            </p>

            {/* Admin controls */}
            {user?.role === "admin" && user._id !== m._id && (
              <div className="task-actions">
                <button
                  className="btn-status"
                  disabled={updatingId === m._id}
                  onClick={() => updateRole(m._id, "member")}
                >
                  Member
                </button>

                <button
                  className="btn-status done"
                  disabled={updatingId === m._id}
                  onClick={() => updateRole(m._id, "admin")}
                >
                  {updatingId === m._id ? "Updating..." : "Admin"}
                </button>
              </div>
            )}

          </div>
        ))}

      </div>
    </div>
  );
};

export default TeamPage;