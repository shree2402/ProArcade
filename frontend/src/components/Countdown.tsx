import { formatDistanceToNowStrict } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import type { AssignedTask } from "../types";

export function Countdown({ task }: { task: AssignedTask | null }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const progress = useMemo(() => {
    if (!task) return 0;
    const started = new Date(task.createdAt).getTime();
    const total = task.durationMinutes * 60 * 1000;
    return Math.min(1, Math.max(0, (now - started) / total));
  }, [task, now]);

  if (!task) {
    return <p className="text-sm text-slate-400">No active task lock. Roll when ready.</p>;
  }

  const end = new Date(new Date(task.createdAt).getTime() + task.durationMinutes * 60 * 1000);
  const remaining = end.getTime() > now ? formatDistanceToNowStrict(end) : "ready for proof";
  const circumference = 2 * Math.PI * 44;

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
        <circle cx="50" cy="50" r="44" stroke="rgba(148,163,184,.22)" strokeWidth="8" fill="none" />
        <circle
          cx="50"
          cy="50"
          r="44"
          stroke="url(#timerGradient)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
        />
        <defs>
          <linearGradient id="timerGradient">
            <stop stopColor="#22d3ee" />
            <stop offset="1" stopColor="#f472b6" />
          </linearGradient>
        </defs>
      </svg>
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-arcade-magenta">Locked Quest</p>
        <h2 className="mt-1 text-2xl font-black">{task.taskName}</h2>
        <p className="mt-1 text-sm text-slate-300">{task.durationMinutes} minutes · {remaining}</p>
      </div>
    </div>
  );
}
