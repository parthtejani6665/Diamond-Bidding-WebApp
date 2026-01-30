import React from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Layout } from "../../components/Layout";
import { NavTabs } from "../../components/NavTabs";

const AdminShell: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <Layout
      title="Admin Dashboard"
      subtitle="Manage users, diamond bids, monitoring & results"
      right={
        <div className="flex items-center gap-4 text-sm">
          <span>{user?.email}</span>
          <button
            onClick={logout}
            className="rounded-lg border border-slate-700 px-3 py-1 text-xs hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
      }
    >
      <div className="mb-6">
        <NavTabs
          tabs={[
            { to: "/admin/users", label: "Users" },
            { to: "/admin/diamonds", label: "Diamonds" },
            { to: "/admin/diamond-bids", label: "Diamond Bids" },
            { to: "/admin/monitor", label: "Monitor" },
            { to: "/admin/results", label: "Results" },
          ]}
        />
      </div>
      <Outlet />
    </Layout>
  );
};

export default AdminShell;

