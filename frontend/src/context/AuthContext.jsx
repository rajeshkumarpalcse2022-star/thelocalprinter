"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  });
  const [loading, setLoading] = useState(true);
  const [vendorOnboarding, setVendorOnboarding] = useState(null);

  useEffect(() => {
    if (token) {
      api
        .get("/auth/me")
        .then((res) => {
          setUser(res.data.data.user);
        })
        .catch(() => {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const checkVendorOnboarding = useCallback(async () => {
    try {
      const res = await api.get("/vendor/onboarding-status");
      setVendorOnboarding(res.data.data);
      return res.data.data;
    } catch {
      setVendorOnboarding(null);
      return null;
    }
  }, []);

  const clearVendorOnboarding = useCallback(() => {
    setVendorOnboarding(null);
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { user: userData, token: tokenData } = res.data.data;
    localStorage.setItem("token", tokenData);
    setToken(tokenData);
    setUser(userData);
    return userData;
  };

  const signup = async (fullName, email, password, role, additionalData = {}) => {
    const res = await api.post("/auth/signup-json", {
      fullName,
      email,
      password,
      role,
      ...additionalData,
    });
    const { user: userData, token: tokenData } = res.data.data;
    localStorage.setItem("token", tokenData);
    setToken(tokenData);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setVendorOnboarding(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.data.user);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        vendorOnboarding,
        login,
        signup,
        logout,
        refreshUser,
        checkVendorOnboarding,
        clearVendorOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
