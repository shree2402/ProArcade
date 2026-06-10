import type { AvatarPreference } from "../types";

type TaskRow = { name: string; durationMinutes: number };

export type OnboardingDraft = {
  favoriteTasks: TaskRow[];
  productiveTasks: TaskRow[];
  avatarPreference: AvatarPreference;
};

const draftKey = "productivity-arcade-onboarding-draft";

export function loadOnboardingDraft() {
  const raw = window.localStorage.getItem(draftKey);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<OnboardingDraft>;
    if (!Array.isArray(parsed.favoriteTasks) || !Array.isArray(parsed.productiveTasks) || !parsed.avatarPreference) {
      return null;
    }
    return parsed as OnboardingDraft;
  } catch {
    return null;
  }
}

export function saveOnboardingDraft(draft: OnboardingDraft) {
  window.localStorage.setItem(draftKey, JSON.stringify(draft));
}

export function clearOnboardingDraft() {
  window.localStorage.removeItem(draftKey);
}
