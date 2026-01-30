import React from "react";
import { NavLink } from "react-router-dom";

const base =
  "rounded-lg px-3 py-2 text-sm border border-transparent hover:bg-slate-900";
const active =
  "bg-slate-900 border-slate-800 text-slate-50";
const inactive =
  "text-slate-300";

export const NavTabs: React.FC<{
  tabs: Array<{ to: string; label: string }>;
}> = ({ tabs }) => {
  return (
    <nav className="flex flex-wrap gap-2">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          className={({ isActive }) =>
            `${base} ${isActive ? active : inactive}`
          }
          end
        >
          {t.label}
        </NavLink>
      ))}
    </nav>
  );
};

