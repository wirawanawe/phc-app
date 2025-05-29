"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@/app/types";
import { useRouter } from "next/navigation";
import SessionExpiredModal from "@/app/components/SessionExpiredModal";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserRole: (newRole: string) => Promise<void>;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState("");

  // Check session status periodically
  useEffect(() => {
    // Define session check function
    const checkSession = async () => {
      // Only check if user is logged in
      if (!user) return;

      try {
        // Make a request to a protected endpoint to verify session
        const response = await fetch("/api/auth/check-session", {
          method: "GET",
          credentials: "include", // Include cookies
        });

        // If session is invalid, show modal and logout the user
        if (!response.ok) {
          console.log("AUTH: Session expired or invalid");

          try {
            const data = await response.json();
            if (data && data.error) {
              setSessionExpiredMessage(data.error);
            } else {
              setSessionExpiredMessage(
                "Sesi login Anda telah berakhir. Harap login kembali untuk melanjutkan."
              );
            }
          } catch (e) {
            setSessionExpiredMessage(
              "Sesi login Anda telah berakhir. Harap login kembali untuk melanjutkan."
            );
          }

          // Show session expired modal
          setSessionModalOpen(true);
        }
      } catch (error) {
        console.error("AUTH: Error checking session:", error);
      }
    };

    // Check immediately when component mounts
    checkSession();

    // Set up interval for session checks
    const interval = setInterval(checkSession, 1000 * 60 * 5); // Check every 5 minutes

    // Clear interval on cleanup
    return () => clearInterval(interval);
  }, [user]);

  // Handle closing the session modal
  const handleCloseSessionModal = async () => {
    setSessionModalOpen(false);
    await logout();
  };

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
      // Check for empty fields
      if (!emailOrUsername || !password) {
        console.error("AUTH: Empty email/username or password");
        setLoading(false);
        return false;
      }

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

        // Ensure the user has all required fields for the User interface
        if (!loggedInUser || !loggedInUser.id) {
          console.error("AUTH: Invalid user data received from server");
          setLoading(false);
          return false;
        }

        console.log(
          "AUTH: User data details:",
          JSON.stringify(loggedInUser, null, 2)
        );

        // Add token to user object if available in response
        if (data.token) {
          loggedInUser.token = data.token;
          console.log("AUTH: Token received and saved to user object");
        }

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
        // Handle different status codes
        let errorMessage = "Login gagal";

        if (response.status === 401) {
          errorMessage = "Email/username atau password salah";
        } else if (response.status === 403) {
          errorMessage = "Akun Anda tidak aktif. Silakan hubungi admin.";
        } else if (response.status === 429) {
          errorMessage =
            "Terlalu banyak percobaan login. Silakan coba lagi nanti.";
        } else if (response.status >= 500) {
          errorMessage =
            "Terjadi kesalahan pada server. Silakan coba lagi nanti.";
        }

        console.log(
          `AUTH: Login failed with status: ${response.status} - ${errorMessage}`
        );

        try {
          // Check if the response has a content-type header
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();

            if (errorData && errorData.error) {
              errorMessage = errorData.error;
              console.error("AUTH: Server error message:", errorData.error);
            }

            console.error("AUTH: Login error details:", errorData || {});
          } else {
            // If not JSON, try to get the text
            const text = await response.text();
            if (text) {
              console.log("AUTH: Non-JSON error response:", text);
              errorMessage = text;
            }
          }
        } catch (parseError) {
          console.error("AUTH: Error parsing error response:", parseError);
          // Keep the default error message
        }

        console.error("AUTH: Login failed:", errorMessage);
        setLoading(false);
        return false;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Terjadi kesalahan saat login";
      console.error("AUTH: Login error:", errorMessage);
      console.error("AUTH: Full error object:", error);
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

  // Fungsi untuk update keseluruhan data user (untuk refresh token)
  const updateUser = (userData: User): void => {
    console.log("AUTH: Updating user data after token refresh");

    if (!userData || !userData.id) {
      console.error("AUTH: Invalid user data provided for update");
      return;
    }

    try {
      // Simpan token dari user lama jika ada dan tidak ada di user data baru
      if (user?.token && !userData.token) {
        userData.token = user.token;
      }

      // Update state
      setUser(userData);

      // Update localStorage
      localStorage.setItem("phc_user", JSON.stringify(userData));
      console.log("AUTH: User data updated successfully after token refresh");
    } catch (error) {
      console.error("AUTH: Error updating user data:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, updateUserRole, updateUser }}
    >
      <SessionExpiredModal
        isOpen={sessionModalOpen}
        message={sessionExpiredMessage}
        onClose={handleCloseSessionModal}
      />
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
