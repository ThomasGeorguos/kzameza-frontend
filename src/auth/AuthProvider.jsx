import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { apiFetch } from "../config/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch("/api/users/verify", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.isAuthenticated) {
          setUser(data.user);
          setRole(data.role);
        } else {
          setUser(null);
          setRole(null);
        }
      })
      .catch(() => {
        setUser(null);
        setRole(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (userData, userRole) => {
    setUser(userData);
    setRole(userRole);
  };

  const logout = async () => {
    try {
      await apiFetch("/api/users/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setUser(null);
      setRole(null);

      navigate("/login");
    }
  };

  // لو لسه loading عرض spinner بسيط
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="animate-spin w-8 h-8 text-[#0B3D4A]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
          <p className="text-[#0B3D4A] text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        role,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
