import { useEffect, useMemo, useState } from "react";
import type { AssignedTask } from "../types";

function formatRemainingTime(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function Countdown({ task }: { task: AssignedTask | null }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const timer = useMemo(() => {
    if (!task) return { progress: 0, remaining: 0 };
    const started = new Date(task.createdAt).getTime();
    const total = task.durationMinutes * 60 * 1000;
    const elapsed = Math.max(0, now - started);
    const remaining = Math.max(0, total - elapsed);
    return { progress: Math.min(1, Math.max(0, elapsed / total)), remaining };
  }, [task, now]);

  if (!task) {
    return <p className="text-sm text-slate-400">No active task lock. Roll when ready.</p>;
  }

  const circumference = 2 * Math.PI * 44;
  const remainingLabel = formatRemainingTime(timer.remaining);
  const isReadyForProof = timer.remaining <= 0;

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-28 w-28 shrink-0">
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
            strokeDashoffset={circumference * (1 - timer.progress)}
          />
          <defs>
            <linearGradient id="timerGradient">
              <stop stopColor="#22d3ee" />
              <stop offset="1" stopColor="#f472b6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-2xl font-black tabular-nums text-white drop-shadow-[0_0_12px_rgba(34,211,238,0.65)]">{remainingLabel}</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{isReadyForProof ? "Upload" : "Left"}</p>
          </div>
        </div>
      </div>
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-arcade-magenta">Locked Quest</p>
        <h2 className="mt-1 text-2xl font-black">{task.taskName}</h2>
        <p className="mt-1 text-sm text-slate-300">{task.durationMinutes} minutes · {isReadyForProof ? "ready for proof" : "countdown running"}</p>
      </div>
    </div>
  );
}
