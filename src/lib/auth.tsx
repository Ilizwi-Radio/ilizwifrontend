"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { getCurrentUser, logoutSession } from "@/lib/api";

export type Role =
  | "registered"
  | "presenter"
  | "moderator"
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
  logout: () => Promise<void>;
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
    let active = true;
    getCurrentUser()
      .then((currentUser) => {
        if (!active) return;
        localStorage.setItem("user", JSON.stringify(currentUser));
        setUser(currentUser);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AuthenticationError") {
          if (!active) return;
          localStorage.removeItem("user");
          setUser(null);
        } else if (error instanceof Error) {
          console.error("Could not verify the current session:", error);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    const syncUser = () => refreshUser();
    window.addEventListener("storage", syncUser);
    return () => {
      active = false;
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  const logout = () => {
    const request = logoutSession().catch((error: unknown) => {
      console.error("Failed to clear the authentication cookie:", error);
    });
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    window.dispatchEvent(new Event("storage"));
    return request;
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
