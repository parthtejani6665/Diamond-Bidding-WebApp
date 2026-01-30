import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactElement;
  role?: "admin" | "user";
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { user, isInitialized } = useAuth();

  console.log("ProtectedRoute - isInitialized:", isInitialized);
  console.log("ProtectedRoute - user:", user);
  console.log("ProtectedRoute - required role:", role);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    const redirectTo = user.role === "admin" ? "/admin" : "/user";
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

