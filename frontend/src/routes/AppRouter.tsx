import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import LoginPage from "../pages/LoginPage";
import AdminShell from "../pages/admin/AdminShell";
import UsersPage from "../pages/admin/UsersPage";
import DiamondsPage from "../pages/admin/DiamondsPage";
import DiamondBidsPage from "../pages/admin/DiamondBidsPage";
import MonitorPage from "../pages/admin/MonitorPage";
import AdminResultsPage from "../pages/admin/ResultsPage";
import UserShell from "../pages/user/UserShell";
import ActiveBidsPage from "../pages/user/ActiveBidsPage";
import MyBidsPage from "../pages/user/MyBidsPage";
import ResultsPage from "../pages/user/ResultsPage";
import { SocketProvider } from "../context/SocketContext";

const DefaultRedirect: React.FC = () => {
  const { user, isInitialized } = useAuth();
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }
  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/user"} replace />;
  }
  return <Navigate to="/login" replace />;
};

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <SocketProvider>
        <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="users" replace />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="diamonds" element={<DiamondsPage />} />
          <Route path="diamond-bids" element={<DiamondBidsPage />} />
          <Route path="monitor" element={<MonitorPage />} />
          <Route path="results" element={<AdminResultsPage />} />
        </Route>

        <Route
          path="/user"
          element={
            <ProtectedRoute role="user">
              <UserShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="active" replace />} />
          <Route path="active" element={<ActiveBidsPage />} />
          <Route path="my-bids" element={<MyBidsPage />} />
          <Route path="results" element={<ResultsPage />} />
        </Route>

        <Route path="*" element={<DefaultRedirect />} />
        </Routes>
      </SocketProvider>
    </BrowserRouter>
  );
};

export default AppRouter;

