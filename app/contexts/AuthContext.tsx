"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@/app/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserRole: (newRole: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on startup
  useEffect(() => {
    console.log("AUTH: Loading user from storage");
    try {
      // Check both possible storage keys
      const storedUser =
        localStorage.getItem("phc_user") || localStorage.getItem("user");
      if (storedUser) {
        console.log("AUTH: Found stored user data");
        const parsedUser = JSON.parse(storedUser);
        // Ensure the user object has the required properties
        if (parsedUser && parsedUser.id) {
          console.log("AUTH: Valid user data found, setting user state");
          setUser(parsedUser);
          // Normalize to always use phc_user
          localStorage.setItem("phc_user", storedUser);
          // Remove old key if it exists
          if (localStorage.getItem("user")) {
            localStorage.removeItem("user");
          }
        } else {
          console.log("AUTH: Stored user data is invalid");
        }
      } else {
        console.log("AUTH: No stored user data found");
      }
    } catch (error) {
      console.error("AUTH: Failed to parse stored user:", error);
      localStorage.removeItem("phc_user");
      localStorage.removeItem("user");
    } finally {
      console.log("AUTH: Auth initialization completed");
      setLoading(false);
    }
  }, []);

  // Login ke server API
  const login = async (
    emailOrUsername: string,
    password: string
  ): Promise<boolean> => {
    console.log("AUTH: Starting login process");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailOrUsername, password }),
        credentials: "include", // Penting: untuk menerima cookie dari server
      });

      console.log("AUTH: Login response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        const loggedInUser = data.user;
        console.log("AUTH: Login successful, user data received");
        console.log(
          "AUTH: User data details:",
          JSON.stringify(loggedInUser, null, 2)
        );

        // Ensure the user has all required fields for the User interface
        setUser(loggedInUser);
        // Simpan user ke localStorage
        localStorage.setItem("phc_user", JSON.stringify(loggedInUser));
        // Clear any old storage format
        localStorage.removeItem("user");

        // Log cookie information (tanpa menunjukkan nilai)
        document.cookie.split(";").forEach((c) => {
          const cookieName = c.trim().split("=")[0];
          console.log("AUTH: Cookie found after login:", cookieName);
        });

        setLoading(false);
        return true;
      } else {
        console.log("AUTH: Login failed with status:", response.status);
        let errorData = {};

        try {
          // Check if the response has a content-type header
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            errorData = await response.json();
          } else {
            // If not JSON, try to get the text
            const text = await response.text();
            console.log("AUTH: Non-JSON error response:", text);
            errorData = { error: text || "Unknown error" };
          }
        } catch (parseError) {
          console.error("AUTH: Error parsing error response:", parseError);
          errorData = { error: "Could not parse error response" };
        }

        console.error("AUTH: Login error details:", errorData);
      }

      setLoading(false);
      return false;
    } catch (error) {
      console.error("AUTH: Login error:", error);
      setLoading(false);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    console.log("AUTH: Starting logout process");
    // Sebelum logout, coba panggil API logout jika ada
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Penting untuk logout cookie
      });
      console.log("AUTH: Logout API call completed");
    } catch (error) {
      console.error("AUTH: Logout error:", error);
      // Tetap lanjutkan proses logout client-side meskipun API error
    }

    // Clean up all possible storage
    setUser(null);
    localStorage.removeItem("phc_user");
    localStorage.removeItem("user");
    console.log("AUTH: Local storage cleared");

    // Remove cookies if needed
    document.cookie.split(";").forEach((c) => {
      const cookieName = c.trim().split("=")[0];
      console.log(`AUTH: Removing cookie: ${cookieName}`);
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    console.log("AUTH: Cookies cleared");
  };

  const updateUserRole = async (newRole: string): Promise<void> => {
    console.log(`AUTH: Updating user role to ${newRole}`);

    if (!user) {
      console.error("AUTH: Cannot update role, no user logged in");
      return;
    }

    try {
      // Update role in local user state
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);

      // Update in localStorage
      localStorage.setItem("phc_user", JSON.stringify(updatedUser));
      console.log("AUTH: User role updated successfully");
    } catch (error) {
      console.error("AUTH: Error updating user role:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, updateUserRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
