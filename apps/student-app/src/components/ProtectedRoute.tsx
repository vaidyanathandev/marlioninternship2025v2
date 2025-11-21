import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loading } from "@marlion/ui";
import type { UserRole } from "@marlion/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: UserRole[];
  requireStatus?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireRole,
  requireStatus,
}) => {
  const { user, convexUser, studentProfile, loading, role } = useAuth();

  if (loading) {
    return <Loading fullScreen />;
  }

  // Check authentication
  if (requireAuth && !user) {
    return <Navigate to="/" replace />;
  }

  // Check role
  if (requireRole && !requireRole.includes(role)) {
    return <Navigate to="/" replace />;
  }

  // Check student status
  if (requireStatus && studentProfile) {
    if (!requireStatus.includes(studentProfile.status)) {
      // Redirect based on current status
      switch (studentProfile.status) {
        case "REGISTERED":
        case "INTERVIEW_PENDING":
          return <Navigate to="/interview" replace />;
        case "INTERVIEW_COMPLETED":
        case "UNDER_REVIEW":
          return <Navigate to="/status" replace />;
        case "OFFER_RELEASED":
          return <Navigate to="/offer" replace />;
        case "REJECTED":
          return <Navigate to="/rejected" replace />;
        case "OFFER_ACCEPTED":
        case "ACTIVE":
          return <Navigate to="/dashboard" replace />;
        case "COMPLETED":
          return <Navigate to="/certificate" replace />;
        case "BANNED":
          return <Navigate to="/banned" replace />;
        default:
          return <Navigate to="/" replace />;
      }
    }
  }

  return <>{children}</>;
};
