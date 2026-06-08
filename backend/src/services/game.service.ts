import { AssignedTaskStatus, GameSessionStatus, TaskPreferenceType } from "@prisma/client";
import { calculateMove, getTileEffect, rollDice, START_TILE, WIN_TILE } from "../lib/board.js";
import { AppError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";

export async function getOrCreateActiveSession(userId: string) {
  const existing = await prisma.gameSession.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { assignedTasks: { orderBy: { createdAt: "desc" }, take: 1 } }
  });

  if (existing) {
    return existing;
  }

  return prisma.gameSession.create({
    data: { userId, currentTile: START_TILE, status: GameSessionStatus.ACTIVE },
    include: { assignedTasks: { orderBy: { createdAt: "desc" }, take: 1 } }
  });
}

export async function rollGameDice(userId: string) {
  const session = await getOrCreateActiveSession(userId);
  if (session.status !== GameSessionStatus.ACTIVE) {
    throw new AppError(409, "Board is locked until the assigned task is verified", "BOARD_LOCKED");
  }
  if (session.currentTile >= WIN_TILE) {
    throw new AppError(409, "This session is already complete", "SESSION_COMPLETE");
  }

  const dice = rollDice();
  const landedTile = calculateMove(session.currentTile, dice);
  const effect = getTileEffect(landedTile);

  if (!effect) {
    const updated = await prisma.gameSession.update({
      where: { id: session.id },
      data: { currentTile: landedTile },
      include: { assignedTasks: { orderBy: { createdAt: "desc" }, take: 1 } }
    });
    return { dice, landedTile, finalTile: landedTile, effect: null, session: updated, assignedTask: null };
  }

  const preferenceType = effect.kind === "LADDER" ? TaskPreferenceType.FAVORITE : TaskPreferenceType.PRODUCTIVE;
  const preferences = await prisma.taskPreference.findMany({ where: { userId, type: preferenceType } });
  if (preferences.length === 0) {
    throw new AppError(400, `No ${preferenceType.toLowerCase()} task preferences exist`, "MISSING_TASK_PREFERENCES");
  }

  const selected = preferences[Math.floor(Math.random() * preferences.length)];
  const lockedStatus = effect.kind === "LADDER" ? GameSessionStatus.LOCKED_BY_LADDER : GameSessionStatus.LOCKED_BY_SNAKE;
  const [updated, assignedTask] = await prisma.$transaction([
    prisma.gameSession.update({
      where: { id: session.id },
      data: { currentTile: effect.to, status: lockedStatus },
      include: { assignedTasks: { orderBy: { createdAt: "desc" }, take: 1 } }
    }),
    prisma.assignedTask.create({
      data: {
        gameSessionId: session.id,
        taskName: selected.name,
        durationMinutes: selected.durationMinutes,
        status: AssignedTaskStatus.PENDING
      }
    })
  ]);

  return { dice, landedTile, finalTile: effect.to, effect, session: updated, assignedTask };
}

export async function getPendingTask(sessionId: string) {
  return prisma.assignedTask.findFirst({
    where: { gameSessionId: sessionId, status: AssignedTaskStatus.PENDING },
    orderBy: { createdAt: "desc" }
  });
}

export async function completePendingTask(input: {
  userId: string;
  sessionId: string;
  taskId: string;
  taskName: string;
  s3Url: string;
}) {
  return prisma.$transaction(async (tx) => {
    const session = await tx.gameSession.findFirst({ where: { id: input.sessionId, userId: input.userId } });
    if (!session || session.status === GameSessionStatus.ACTIVE) {
      throw new AppError(409, "No locked game session found", "SESSION_NOT_LOCKED");
    }

    await tx.assignedTask.update({
      where: { id: input.taskId },
      data: { status: AssignedTaskStatus.VERIFIED }
    });

    await tx.mediaGallery.create({
      data: {
        userId: input.userId,
        taskName: input.taskName,
        s3Url: input.s3Url
      }
    });

    return tx.gameSession.update({
      where: { id: input.sessionId },
      data: { status: GameSessionStatus.ACTIVE },
      include: { assignedTasks: { orderBy: { createdAt: "desc" }, take: 1 } }
    });
  });
}
