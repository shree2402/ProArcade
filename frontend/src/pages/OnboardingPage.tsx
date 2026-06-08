import { LogOut, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AvatarSelector } from "../components/AvatarSelector";
import { api } from "../lib/api";
import { defaultAvatarPreference, getAvatarPreference, saveAvatarPreference } from "../lib/avatar";
import { useAuth } from "../state/AuthContext";
import type { AvatarPreference, TaskPreference } from "../types";

type TaskRow = { name: string; durationMinutes: number };

const starterFavorites: TaskRow[] = [
  { name: "Play guitar", durationMinutes: 20 },
  { name: "Read fiction", durationMinutes: 25 },
  { name: "Make tea and sketch", durationMinutes: 15 }
];

const starterProductive: TaskRow[] = [
  { name: "Deep work sprint", durationMinutes: 45 },
  { name: "Workout session", durationMinutes: 40 },
  { name: "Clean one zone", durationMinutes: 30 }
];

function TaskEditor({
  title,
  subtitle,
  tasks,
  setTasks,
  max,
  min
}: {
  title: string;
  subtitle: string;
  tasks: TaskRow[];
  setTasks: (tasks: TaskRow[]) => void;
  max: number;
  min: number;
}) {
  return (
    <section className="glass-panel rounded-lg p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">{title}</h2>
          <p className="text-sm text-slate-400">{subtitle}</p>
        </div>
        <button
          type="button"
          title="Add task"
          onClick={() => setTasks([...tasks, { name: "", durationMinutes: min }])}
          className="rounded-lg bg-white/10 p-2 text-arcade-cyan hover:bg-cyan-400/20"
        >
          <Plus size={18} />
        </button>
      </div>
      <div className="space-y-3">
        {tasks.map((task, index) => (
          <div key={index} className="grid gap-3 sm:grid-cols-[1fr_140px_44px]">
            <input
              value={task.name}
              onChange={(event) => setTasks(tasks.map((item, taskIndex) => (taskIndex === index ? { ...item, name: event.target.value } : item)))}
              className="rounded-lg border border-white/10 bg-black/30 px-3 py-3 outline-none focus:border-cyan-300/60"
              placeholder="Task name"
              required
            />
            <input
              value={task.durationMinutes}
              onChange={(event) =>
                setTasks(tasks.map((item, taskIndex) => (taskIndex === index ? { ...item, durationMinutes: Number(event.target.value) } : item)))
              }
              className="rounded-lg border border-white/10 bg-black/30 px-3 py-3 outline-none focus:border-pink-300/60"
              type="number"
              min={min}
              max={max}
              required
            />
            <button
              type="button"
              title="Remove task"
              onClick={() => setTasks(tasks.filter((_, taskIndex) => taskIndex !== index))}
              className="rounded-lg bg-rose-400/10 p-3 text-rose-300 hover:bg-rose-400/20"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const { logout, setOnboardingComplete } = useAuth();
  const [favoriteTasks, setFavoriteTasks] = useState(starterFavorites);
  const [productiveTasks, setProductiveTasks] = useState(starterProductive);
  const [avatarPreference, setAvatarPreference] = useState<AvatarPreference>(defaultAvatarPreference);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const canSubmit = useMemo(
    () =>
      favoriteTasks.length >= 3 &&
      productiveTasks.length >= 3 &&
      favoriteTasks.every((task) => task.name.trim().length >= 2 && task.durationMinutes >= 5 && task.durationMinutes <= 30) &&
      productiveTasks.every((task) => task.name.trim().length >= 2 && task.durationMinutes >= 30 && task.durationMinutes <= 120),
    [favoriteTasks, productiveTasks]
  );

  useEffect(() => {
    setAvatarPreference(getAvatarPreference());
    api.get<{ tasks: TaskPreference[] }>("/profile/tasks")
      .then((data) => {
        const favorites = data.tasks.filter((task) => task.type === "FAVORITE").map(({ name, durationMinutes }) => ({ name, durationMinutes }));
        const productive = data.tasks.filter((task) => task.type === "PRODUCTIVE").map(({ name, durationMinutes }) => ({ name, durationMinutes }));
        if (favorites.length > 0) setFavoriteTasks(favorites);
        if (productive.length > 0) setProductiveTasks(productive);
      })
      .catch(() => undefined);
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) {
      setError("Add at least 3 valid favorite tasks and 3 valid productive tasks.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      saveAvatarPreference(avatarPreference);
      await api.post("/profile/tasks", { favoriteTasks, productiveTasks });
      await api.post("/game/start");
      setOnboardingComplete();
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <form onSubmit={submit} className="mx-auto max-w-5xl space-y-5">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-arcade-cyan">Task Profiler</p>
            <h1 className="mt-2 text-4xl font-black neon-text">Choose your ladders and snakes</h1>
            <p className="mt-3 max-w-2xl text-slate-300">Rewards stay short. Challenges become substantial. The board will pull from these lists whenever you land on a special tile.</p>
          </div>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex shrink-0 items-center justify-center gap-2 rounded-lg border border-rose-300/30 bg-rose-400/10 px-4 py-3 font-bold text-rose-200 transition hover:bg-rose-400/20"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
        <AvatarSelector value={avatarPreference} onChange={setAvatarPreference} />
        <TaskEditor title="Favorite Tasks" subtitle="Ladder rewards, 5 to 30 minutes." tasks={favoriteTasks} setTasks={setFavoriteTasks} min={5} max={30} />
        <TaskEditor title="Productivity Tasks" subtitle="Snake challenges, 30 to 120 minutes." tasks={productiveTasks} setTasks={setProductiveTasks} min={30} max={120} />
        {error && <p className="rounded-lg border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200">{error}</p>}
        <button disabled={saving || !canSubmit} className="w-full rounded-lg bg-gradient-to-r from-lime-300 via-cyan-300 to-pink-300 px-5 py-4 font-black text-slate-950 shadow-neon disabled:cursor-not-allowed disabled:opacity-60">
          {saving ? "Saving profile..." : "Start the Arcade"}
        </button>
      </form>
    </div>
  );
}
