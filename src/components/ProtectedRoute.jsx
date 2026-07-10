import { Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function ProtectedRoute({ children, requireRole }) {
  const { currentUser } = useApp();

  if (!currentUser) return <Navigate to="/login" replace />;
  if (requireRole && currentUser.role !== requireRole) {
    return <Navigate to={currentUser.role === "admin" ? "/admin" : "/app"} replace />;
  }
  return children;
}
