import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/UseAuth";

function GuestRoute({ children }) {
  const { user, role, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return <Navigate to={role === "admin" ? "/admin" : "/"} replace />;
  }

  return children;
}

export default GuestRoute;
