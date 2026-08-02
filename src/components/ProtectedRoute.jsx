import { useAuth } from "../auth/UseAuth";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;

  return children;
}

export default ProtectedRoute;
