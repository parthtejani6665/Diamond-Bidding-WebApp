import React from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Layout } from "../../components/Layout";
import { NavTabs } from "../../components/NavTabs";

const UserShell: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <Layout
      title="User Dashboard"
      subtitle="Browse active bids, place/edit bids, and view results"
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
            { to: "/user/active", label: "Active Bids" },
            { to: "/user/my-bids", label: "My Bids" },
            { to: "/user/results", label: "Results" },
          ]}
        />
      </div>
      <Outlet />
    </Layout>
  );
};

export default UserShell;

