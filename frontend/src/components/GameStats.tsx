import { Activity, Camera, Flag, Zap } from "lucide-react";
import type React from "react";
import { formatEnumLabel } from "../lib/format";
import type { GameState } from "../types";

function Stat({
  icon,
  label,
  value,
  accent
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className={accent}>{icon}</span>
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</span>
      </div>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}

export function GameStats({ state }: { state: GameState }) {
  const completed = Math.max(0, state.session.currentTile - 1);
  const progress = Math.round((completed / 99) * 100);

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Stat icon={<Flag size={20} />} label="Progress" value={`${progress}%`} accent="text-arcade-cyan" />
      <Stat icon={<Zap size={20} />} label="Tile" value={`${state.session.currentTile}/100`} accent="text-arcade-lime" />
      <Stat icon={<Activity size={20} />} label="Status" value={formatEnumLabel(state.session.status)} accent="text-arcade-magenta" />
      <Stat icon={<Camera size={20} />} label="Proofs" value={`${state.gallery.length}`} accent="text-rose-300" />
    </section>
  );
}
