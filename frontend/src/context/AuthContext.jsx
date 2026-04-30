import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // restore session on reload
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedUser = localStorage.getItem("taskflow_user");
        const savedToken = localStorage.getItem("taskflow_token");

        if (savedUser && savedToken) {
          // optional: verify token by calling backend
          const { data } = await api.get("/auth/me");
          setUser(data);
        }
      } catch (err) {
        // token invalid → clear storage
        localStorage.removeItem("taskflow_token");
        localStorage.removeItem("taskflow_user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // login
  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });

      localStorage.setItem("taskflow_token", data.token);
      localStorage.setItem("taskflow_user", JSON.stringify(data.user));

      setUser(data.user);
      return data.user;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Login failed"
      );
    }
  };

  // register
  const register = async (name, email, password, role) => {
    try {
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });

      localStorage.setItem("taskflow_token", data.token);
      localStorage.setItem("taskflow_user", JSON.stringify(data.user));

      setUser(data.user);
      return data.user;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Registration failed"
      );
    }
  };

  // logout
  const logout = () => {
    localStorage.removeItem("taskflow_token");
    localStorage.removeItem("taskflow_user");
    setUser(null);
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// custom hook
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};