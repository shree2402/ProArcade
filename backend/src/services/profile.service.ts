import { TaskPreferenceType } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export async function getOnboardingStatus(userId: string) {
  const [favoriteCount, productiveCount] = await Promise.all([
    prisma.taskPreference.count({ where: { userId, type: TaskPreferenceType.FAVORITE } }),
    prisma.taskPreference.count({ where: { userId, type: TaskPreferenceType.PRODUCTIVE } })
  ]);

  return {
    favoriteCount,
    productiveCount,
    onboardingRequired: favoriteCount < 3 || productiveCount < 3
  };
}
