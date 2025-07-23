import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({
  children,
  adminOnly = false,
}: ProtectedRouteProps) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" />;
  if (adminOnly && !user.isAdmin) return <Navigate to="/home" />;
  
  return children;
}
