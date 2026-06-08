import { Lock, ShieldAlert, ShieldCheck, Trophy } from "lucide-react";
import { Countdown } from "./Countdown";
import { formatEnumLabel } from "../lib/format";
import type { AssignedTask, GameStatus } from "../types";

export function QuestPanel({
  task,
  status,
  lastRollText,
  error,
  verification
}: {
  task: AssignedTask | null;
  status: GameStatus;
  lastRollText: string | null;
  error: string | null;
  verification: { verified: boolean; reason: string; confidence: number } | null;
}) {
  const locked = status !== "ACTIVE";

  return (
    <section className="glass-panel rounded-lg p-5 shadow-neon">
      <div className="mb-4 flex items-center justify-between">
        <span className={`rounded-full px-3 py-1 text-xs font-black ${locked ? "bg-rose-400/15 text-rose-200" : "bg-lime-400/15 text-lime-200"}`}>
          {formatEnumLabel(status)}
        </span>
        {locked ? <Lock className="text-rose-300" /> : <Trophy className="text-lime-300" />}
      </div>
      <Countdown task={task} />
      {lastRollText && <p className="mt-4 rounded-lg bg-white/5 p-3 text-sm text-slate-300">{lastRollText}</p>}
      {verification && (
        <div className={`mt-4 rounded-lg border p-3 text-sm ${verification.verified ? "border-lime-300/30 bg-lime-300/10 text-lime-100" : "border-rose-300/30 bg-rose-300/10 text-rose-100"}`}>
          <div className="mb-1 flex items-center gap-2 font-black">
            {verification.verified ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
            Claude confidence {Math.round(verification.confidence * 100)}%
          </div>
          <p>{verification.reason}</p>
        </div>
      )}
      {error && <p className="mt-4 rounded-lg border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200">{error}</p>}
    </section>
  );
}
