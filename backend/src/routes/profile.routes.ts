import { TaskPreferenceType } from "@prisma/client";
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { taskPreferencesSchema } from "../validation/profile.schemas.js";
import { toTaskPreferenceDto } from "../lib/dto.js";
import { getOnboardingStatus } from "../services/profile.service.js";

export const profileRouter = Router();

profileRouter.post(
  "/tasks",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = taskPreferencesSchema.parse(req.body);
    const userId = req.user!.id;

    await prisma.$transaction([
      prisma.taskPreference.deleteMany({ where: { userId } }),
      prisma.taskPreference.createMany({
        data: [
          ...input.favoriteTasks.map((task) => ({ ...task, userId, type: TaskPreferenceType.FAVORITE })),
          ...input.productiveTasks.map((task) => ({ ...task, userId, type: TaskPreferenceType.PRODUCTIVE }))
        ]
      })
    ]);

    const saved = await prisma.taskPreference.findMany({
      where: { userId },
      orderBy: [{ type: "asc" }, { name: "asc" }]
    });
    const onboarding = await getOnboardingStatus(userId);

    res.status(201).json({ ok: true, onboardingRequired: onboarding.onboardingRequired, tasks: saved.map(toTaskPreferenceDto) });
  })
);

profileRouter.get(
  "/tasks",
  requireAuth,
  asyncHandler(async (req, res) => {
    const tasks = await prisma.taskPreference.findMany({
      where: { userId: req.user!.id },
      orderBy: [{ type: "asc" }, { name: "asc" }]
    });
    const onboarding = await getOnboardingStatus(req.user!.id);

    res.json({ tasks: tasks.map(toTaskPreferenceDto), onboardingRequired: onboarding.onboardingRequired });
  })
);
