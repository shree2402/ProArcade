import type { AvatarPreference } from "../types";

const storageKey = "productivity-arcade-avatar";

export const defaultAvatarPreference: AvatarPreference = {
  kind: "cat",
  outfitColor: "#22d3ee"
};

export const outfitColors = ["#ef4444", "#22d3ee", "#a3e635", "#f472b6", "#8b5cf6", "#f97316"];

export function getAvatarPreference(): AvatarPreference {
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return defaultAvatarPreference;

  try {
    const parsed = JSON.parse(raw) as Partial<AvatarPreference>;
    if (!parsed.kind || !["male", "female", "cat"].includes(parsed.kind)) {
      return defaultAvatarPreference;
    }

    return {
      kind: parsed.kind,
      outfitColor: parsed.outfitColor || defaultAvatarPreference.outfitColor
    };
  } catch {
    return defaultAvatarPreference;
  }
}

export function saveAvatarPreference(preference: AvatarPreference) {
  window.localStorage.setItem(storageKey, JSON.stringify(preference));
}
