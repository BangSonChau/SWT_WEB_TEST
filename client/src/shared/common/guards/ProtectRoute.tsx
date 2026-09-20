import React from "react";
import type { Role } from "../../../feature/auth/type";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../../feature/auth/store";

//ProtectedRoute
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const { accessToken, role } = useAuthStore();

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
