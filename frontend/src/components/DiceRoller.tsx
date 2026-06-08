import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react";

const diceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

export function DiceRoller({
  value,
  disabled,
  rolling,
  onRoll
}: {
  value: number | null;
  disabled: boolean;
  rolling: boolean;
  onRoll: () => void;
}) {
  const Icon = diceIcons[Math.max(0, Math.min(5, (value ?? 6) - 1))];

  return (
    <div className="glass-panel rounded-lg p-5 shadow-neon">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-arcade-cyan">Dice Core</p>
          <p className="mt-1 text-sm text-slate-400">{disabled ? "Board lock active" : "Next action is one roll away"}</p>
        </div>
        <div className={`grid h-16 w-16 place-items-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-arcade-cyan ${rolling ? "animate-pulseGlow" : ""}`}>
          <Icon size={34} />
        </div>
      </div>
      <button
        disabled={disabled || rolling}
        onClick={onRoll}
        className="mt-5 flex w-full items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-cyan-400 to-lime-300 px-5 py-3 font-black text-slate-950 shadow-neon transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Icon size={20} />
        {rolling ? "Rolling..." : "Roll Dice"}
      </button>
    </div>
  );
}
