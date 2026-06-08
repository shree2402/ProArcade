import type { AvatarPreference } from "../types";

function Face({ cx = 32, cy = 24 }: { cx?: number; cy?: number }) {
  return (
    <>
      <circle cx={cx} cy={cy} r="14" fill="#f8cfa2" />
      <circle cx={cx - 5} cy={cy - 2} r="1.6" fill="#020617" />
      <circle cx={cx + 5} cy={cy - 2} r="1.6" fill="#020617" />
      <path d={`M ${cx - 5} ${cy + 5} Q ${cx} ${cy + 10} ${cx + 5} ${cy + 5}`} fill="#7f1d1d" />
      <path d={`M ${cx - 4} ${cy + 4.5} Q ${cx} ${cy + 6.7} ${cx + 4} ${cy + 4.5}`} stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </>
  );
}

function MaleAvatar({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full animate-float drop-shadow-[0_0_8px_rgba(34,211,238,.75)]">
      <ellipse cx="32" cy="59" rx="17" ry="3" fill="#020617" opacity="0.28" />
      <path d="M18 39 q14 -10 28 0 v16 H18z" fill={color} />
      <path d="M21 55 h8 v6 h-8zM35 55 h8 v6h-8z" fill="#0f172a" />
      <path d="M17 42 q-8 3 -10 -4 M47 42 q8 3 10 -4" stroke="#f8cfa2" strokeWidth="5" strokeLinecap="round" fill="none" />
      <Face />
      <path d="M18 22 q2 -18 23 -14 q11 2 9 16 q-12 -6 -22 -1 q-6 3 -10 -1z" fill="#111014" />
      <circle cx="18" cy="26" r="4" fill="#f8cfa2" />
      <circle cx="46" cy="26" r="4" fill="#f8cfa2" />
    </svg>
  );
}

function FemaleAvatar({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full animate-float drop-shadow-[0_0_8px_rgba(244,114,182,.75)]">
      <ellipse cx="32" cy="59" rx="18" ry="3" fill="#020617" opacity="0.28" />
      <path d="M13 27 q3 -22 24 -20 q21 4 14 35 q-15 10 -34 0 q-7 -9 -4 -15z" fill="#facc15" />
      <Face cx={32} cy={25} />
      <path d="M22 40 h20 l8 17 H14z" fill={color} />
      <path d="M23 40 q9 8 18 0" fill="#0f172a" opacity="0.25" />
      <path d="M20 43 q-6 5 -7 0 M44 43 q6 5 7 0" stroke="#f8cfa2" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M21 18 q16 -18 30 6 q-13 -2 -24 -9 q-3 2 -6 3z" fill="#fde047" />
    </svg>
  );
}

function CatAvatar() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full animate-float drop-shadow-[0_0_8px_rgba(163,230,53,.8)]">
      <ellipse cx="32" cy="59" rx="18" ry="3" fill="#020617" opacity="0.28" />
      <path d="M17 28 q-14 -9 -14 4 q0 9 17 8" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M17 22 l7 -9 l6 8 M47 22 l-7 -9 l-6 8" fill="#f59e0b" />
      <ellipse cx="32" cy="37" rx="21" ry="17" fill="#f59e0b" />
      <path d="M18 40 q14 11 28 0 v13 H18z" fill="#fbbf24" opacity="0.95" />
      <circle cx="25" cy="33" r="2" fill="#020617" />
      <circle cx="39" cy="33" r="2" fill="#020617" />
      <path d="M31 38 l2 0 l-1 2z" fill="#fff7ed" />
      <path d="M27 43 q5 4 10 0" stroke="#fff7ed" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M18 35 h-9 M18 39 h-9 M46 35 h9 M46 39 h9" stroke="#020617" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M23 24 v-5 M31 22 v-5 M39 24 v-5" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function AvatarToken({ preference }: { preference: AvatarPreference }) {
  if (preference.kind === "male") {
    return <MaleAvatar color={preference.outfitColor} />;
  }

  if (preference.kind === "female") {
    return <FemaleAvatar color={preference.outfitColor} />;
  }

  return <CatAvatar />;
}
