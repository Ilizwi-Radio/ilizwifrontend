"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export type Role =
  | "registered"
  | "presenter"
  | "admin";

export type AuthUser = {
  id: string;
  full_name: string;
  email: string;
  role: Role;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  logout: () => void;
  refreshUser: () => void;
};

const AuthContext =
  createContext<AuthContextValue | null>(
    null
  );

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  const refreshUser = () => {
    try {
      const raw =
        localStorage.getItem("user");

      if (raw) {
        setUser(JSON.parse(raw));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser();
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx =
    useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return ctx;
}