import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      }
      setLoading(false);
    };
    verifyToken();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    if (res.data.success) {
      const userData = res.data.data;
      localStorage.setItem("accessToken", userData.accessToken);
      localStorage.setItem("refreshToken", userData.refreshToken);
      const userToStore = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      };
      localStorage.setItem("user", JSON.stringify(userToStore));
      setUser(userToStore);
      return userData;
    }
    throw new Error("Login failed");
  };

  const register = async (name, email, password, phone) => {
    const res = await api.post("/auth/register", {
      name,
      email,
      password,
      phone,
    });
    if (res.data.success) {
      const userData = res.data.data;
      localStorage.setItem("accessToken", userData.accessToken);
      localStorage.setItem("refreshToken", userData.refreshToken);
      const userToStore = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      };
      localStorage.setItem("user", JSON.stringify(userToStore));
      setUser(userToStore);
      return userData;
    }
    throw new Error("Registration failed");
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
