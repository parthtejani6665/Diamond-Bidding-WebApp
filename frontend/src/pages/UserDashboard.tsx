import React from "react";
import { useAuth } from "../context/AuthContext";

const UserDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="flex items-center justify-between px-8 py-4 border-b border-slate-800">
        <h1 className="text-xl font-semibold">User Dashboard</h1>
        <div className="flex items-center gap-4 text-sm">
          <span>{user?.email}</span>
          <button
            onClick={logout}
            className="rounded-lg border border-slate-700 px-3 py-1 text-xs hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="p-8">
        <p className="text-sm text-slate-400">
          User features (active bids, place/edit bids, history, results) will be built here.
        </p>
      </main>
    </div>
  );
};

export default UserDashboard;

