import { Check } from "lucide-react";
import { AvatarToken } from "./AvatarToken";
import { outfitColors } from "../lib/avatar";
import type { AvatarKind, AvatarPreference } from "../types";

const avatarOptions: Array<{ kind: AvatarKind; label: string }> = [
  { kind: "male", label: "Boy" },
  { kind: "female", label: "Girl" },
  { kind: "cat", label: "Cat" }
];

export function AvatarSelector({
  value,
  onChange
}: {
  value: AvatarPreference;
  onChange: (value: AvatarPreference) => void;
}) {
  const supportsDressColor = value.kind !== "cat";

  return (
    <section className="glass-panel rounded-lg p-5">
      <div className="mb-4">
        <h2 className="text-xl font-black">Choose Your Game Character</h2>
        <p className="text-sm text-slate-400">This character replaces the green coin and slides across the board when you roll.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {avatarOptions.map((option) => {
          const selected = value.kind === option.kind;
          return (
            <button
              key={option.kind}
              type="button"
              onClick={() => onChange({ ...value, kind: option.kind })}
              className={`rounded-lg border p-4 text-left transition hover:-translate-y-1 hover:bg-white/10 ${
                selected ? "border-cyan-300 bg-cyan-300/10 shadow-neon" : "border-white/10 bg-white/[0.04]"
              }`}
            >
              <div className="mx-auto mb-3 h-20 w-20">
                <AvatarToken preference={{ ...value, kind: option.kind }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-black">{option.label}</span>
                {selected && <Check className="text-arcade-cyan" size={18} />}
              </div>
            </button>
          );
        })}
      </div>

      {supportsDressColor && (
        <div className="mt-5">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-slate-400">Dress Color</p>
          <div className="flex flex-wrap gap-3">
            {outfitColors.map((color) => (
              <button
                key={color}
                type="button"
                title={color}
                onClick={() => onChange({ ...value, outfitColor: color })}
                className={`h-10 w-10 rounded-full border-2 transition hover:scale-110 ${
                  value.outfitColor === color ? "border-white shadow-neon" : "border-white/20"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
