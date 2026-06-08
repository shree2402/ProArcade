import { Gamepad2, Images, LogOut, Sparkles } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export function AppShell() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <header className="mx-auto mb-6 flex max-w-7xl items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 shadow-neon backdrop-blur">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-cyan-400/15 text-arcade-cyan ring-1 ring-cyan-300/40">
            <Sparkles />
          </span>
          <div>
            <p className="text-lg font-black tracking-wide neon-text">Productivity Arcade</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
        </Link>
        <nav className="flex items-center gap-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `rounded-lg p-3 transition hover:bg-white/10 ${isActive ? "bg-cyan-400/15 text-arcade-cyan" : "text-slate-300"}`
            }
            title="Game"
          >
            <Gamepad2 size={20} />
          </NavLink>
          <NavLink
            to="/gallery"
            className={({ isActive }) =>
              `rounded-lg p-3 transition hover:bg-white/10 ${isActive ? "bg-pink-400/15 text-arcade-magenta" : "text-slate-300"}`
            }
            title="Gallery"
          >
            <Images size={20} />
          </NavLink>
          <button
            onClick={() => void logout()}
            className="rounded-lg p-3 text-slate-300 transition hover:bg-rose-400/15 hover:text-rose-300"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl">
        <Outlet />
      </main>
    </div>
  );
}
