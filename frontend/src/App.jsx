import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import MyTasksPage from "./pages/MyTasksPage";
import TeamPage from "./pages/TeamPage"; // 🔥 NEW

import AppLayout from "./components/layout/AppLayout";

import "./index.css";

/* ─── Loading Screen ───────────────── */
const LoadingScreen = () => (
  <div className="loading-screen">Loading...</div>
);

/* ─── Private Route ───────────────── */
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

/* ─── Public Route ───────────────── */
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/dashboard" replace />;

  return children;
};

/* ─── Admin Route (🔥 NEW) ───────────────── */
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

/* ─── App Routes ───────────────── */
const AppRoutes = () => {
  return (
    <Routes>

      {/* 🔓 Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* 🔐 Protected Routes (with Layout) */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        {/* Default redirect */}
        <Route index element={<Navigate to="dashboard" replace />} />

        {/* Core Pages */}
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:id" element={<ProjectDetailPage />} />
        <Route path="my-tasks" element={<MyTasksPage />} />

        {/* 🔥 Admin-only Route */}
        <Route
          path="team"
          element={
            <AdminRoute>
              <TeamPage />
            </AdminRoute>
          }
        />
      </Route>

      {/* 🔁 Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
};

/* ─── Main App ───────────────── */
const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;