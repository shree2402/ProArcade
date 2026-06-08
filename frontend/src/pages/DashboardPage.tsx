import { useEffect, useState } from "react";
import { Board } from "../components/Board";
import { DiceRoller } from "../components/DiceRoller";
import { GameStats } from "../components/GameStats";
import { QuestPanel } from "../components/QuestPanel";
import { UploadZone } from "../components/UploadZone";
import { VictoryMontage } from "../components/VictoryMontage";
import { useGame } from "../hooks/useGame";
import { defaultAvatarPreference, getAvatarPreference } from "../lib/avatar";
import type { AvatarPreference } from "../types";

export function DashboardPage() {
  const { state, lastRoll, loading, busy, error, verification, roll, verifyProof } = useGame();
  const [displayTile, setDisplayTile] = useState(1);
  const [animatingMove, setAnimatingMove] = useState(false);
  const [avatarPreference, setAvatarPreference] = useState<AvatarPreference>(defaultAvatarPreference);

  useEffect(() => {
    setAvatarPreference(getAvatarPreference());
  }, []);

  useEffect(() => {
    if (state && !animatingMove) {
      setDisplayTile(state.session.currentTile);
    }
  }, [state, animatingMove]);

  if (loading || !state) {
    return <div className="glass-panel rounded-lg p-8 text-arcade-cyan">Synchronizing saved session...</div>;
  }

  if (state.victory && !animatingMove) {
    return <VictoryMontage items={state.gallery} />;
  }

  const locked = state.session.status !== "ACTIVE";
  const lastRollText = lastRoll
    ? `Dice ${lastRoll.dice}: landed on ${lastRoll.landedTile}, moved to ${lastRoll.finalTile}${lastRoll.effect ? ` via ${lastRoll.effect.kind.toLowerCase()}` : ""}.`
    : null;
  const recentProofs = state.gallery.slice(-4).reverse();
  const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));
  const animateRoll = async () => {
    if (busy || locked || animatingMove) return;
    const startTile = displayTile;
    setAnimatingMove(true);
    try {
      const result = await roll();
      const steps: number[] = [];
      for (let tile = startTile + 1; tile <= result.landedTile; tile += 1) {
        steps.push(tile);
      }

      if (steps.length === 0) {
        steps.push(result.landedTile);
      }

      for (const tile of steps) {
        setDisplayTile(tile);
        await sleep(520);
      }

      if (result.effect && result.finalTile !== result.landedTile) {
        await sleep(350);
        setDisplayTile(result.finalTile);
        await sleep(650);
      }
    } finally {
      setAnimatingMove(false);
    }
  };

  return (
    <div className="space-y-6">
      <GameStats state={state} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-arcade-cyan">Tile {state.session.currentTile} / 100</p>
              <h1 className="mt-1 text-3xl font-black neon-text">Conditioning Board</h1>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-right">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Mode</p>
              <p className="text-sm font-black text-slate-200">{locked ? "Proof Required" : "Roll Ready"}</p>
            </div>
          </div>
          <Board currentTile={displayTile} ladders={state.board.ladders} snakes={state.board.snakes} avatarPreference={avatarPreference} />
        </section>

        <aside className="space-y-4">
          <DiceRoller value={lastRoll?.dice ?? null} disabled={locked || animatingMove} rolling={(busy || animatingMove) && !locked} onRoll={() => void animateRoll()} />
          <QuestPanel task={state.pendingTask} status={state.session.status} lastRollText={lastRollText} error={error} verification={verification} />

          {locked && (
            <section className="glass-panel rounded-lg p-5 shadow-neon">
              <UploadZone disabled={busy} onVerify={verifyProof} />
            </section>
          )}
        </aside>
      </div>

      <section className="glass-panel rounded-lg p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-arcade-magenta">Session Reel</p>
            <h2 className="text-xl font-black">Recent verified proofs</h2>
          </div>
        </div>
        {recentProofs.length === 0 ? (
          <p className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-400">Verified images will accumulate here as each locked task is cleared.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {recentProofs.map((item) => (
              <figure key={item.id} className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
                <img src={item.s3Url} alt={item.taskName} className="h-32 w-full object-cover" />
                <figcaption className="p-3 text-sm font-bold text-slate-200">{item.taskName}</figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
