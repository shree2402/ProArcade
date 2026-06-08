import multer from "multer";
import { Router } from "express";
import { GameSessionStatus } from "@prisma/client";
import { requireAuth } from "../middleware/auth.js";
import { gameLimiter, uploadLimiter } from "../middleware/rateLimit.js";
import { AppError, asyncHandler } from "../lib/errors.js";
import { getOrCreateActiveSession, getPendingTask, rollGameDice, completePendingTask } from "../services/game.service.js";
import { uploadProofToS3 } from "../services/s3.service.js";
import { verifyProofWithBedrock } from "../services/bedrock.service.js";
import { prisma } from "../lib/prisma.js";
import { ladders, snakes, tileEffects, WIN_TILE } from "../lib/board.js";
import { toAssignedTaskDto, toGameSessionDto, toMediaGalleryDto } from "../lib/dto.js";
import { assertValidImageFile, isSupportedImageMimeType } from "../lib/image.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!isSupportedImageMimeType(file.mimetype)) {
      return cb(new AppError(400, "Only JPEG, PNG, and WebP images are accepted", "INVALID_IMAGE_TYPE"));
    }
    cb(null, true);
  }
});

export const gameRouter = Router();
gameRouter.use(requireAuth, gameLimiter);

gameRouter.post(
  "/start",
  asyncHandler(async (req, res) => {
    const session = await getOrCreateActiveSession(req.user!.id);
    const pendingTask = session.status === GameSessionStatus.ACTIVE ? null : await getPendingTask(session.id);
    res.status(201).json({
      session: toGameSessionDto(session),
      pendingTask: toAssignedTaskDto(pendingTask),
      board: { ladders, snakes, effects: tileEffects, winTile: WIN_TILE }
    });
  })
);

gameRouter.get(
  "/state",
  asyncHandler(async (req, res) => {
    const session = await getOrCreateActiveSession(req.user!.id);
    const pendingTask = session.status === GameSessionStatus.ACTIVE ? null : await getPendingTask(session.id);
    const gallery = await prisma.mediaGallery.findMany({
      where: { userId: req.user!.id },
      orderBy: { uploadedAt: "asc" }
    });

    res.json({
      session: toGameSessionDto(session),
      pendingTask: toAssignedTaskDto(pendingTask),
      gallery: gallery.map(toMediaGalleryDto),
      board: { ladders, snakes, effects: tileEffects, winTile: WIN_TILE },
      victory: session.currentTile >= WIN_TILE
    });
  })
);

gameRouter.post(
  "/roll",
  asyncHandler(async (req, res) => {
    const result = await rollGameDice(req.user!.id);
    const gallery = result.finalTile >= WIN_TILE
      ? await prisma.mediaGallery.findMany({ where: { userId: req.user!.id }, orderBy: { uploadedAt: "asc" } })
      : [];

    res.json({
      dice: result.dice,
      landedTile: result.landedTile,
      finalTile: result.finalTile,
      effect: result.effect,
      session: toGameSessionDto(result.session),
      assignedTask: toAssignedTaskDto(result.assignedTask),
      gallery: gallery.map(toMediaGalleryDto),
      victory: result.finalTile >= WIN_TILE
    });
  })
);

gameRouter.post(
  "/verify-proof",
  uploadLimiter,
  upload.single("image"),
  asyncHandler(async (req, res) => {
    const file = req.file;
    if (!file) {
      throw new AppError(400, "Proof image is required", "PROOF_IMAGE_REQUIRED");
    }
    assertValidImageFile(file);

    const session = await getOrCreateActiveSession(req.user!.id);
    if (session.status === GameSessionStatus.ACTIVE) {
      throw new AppError(409, "There is no locked task to verify", "NO_PENDING_TASK");
    }

    const pendingTask = await getPendingTask(session.id);
    if (!pendingTask) {
      throw new AppError(409, "No pending task found for this locked session", "PENDING_TASK_MISSING");
    }

    const s3Url = await uploadProofToS3({ userId: req.user!.id, sessionId: session.id, file });
    const verification = await verifyProofWithBedrock({
      imageBuffer: file.buffer,
      mimeType: file.mimetype,
      taskName: pendingTask.taskName,
      durationMinutes: pendingTask.durationMinutes
    });

    if (!verification.verified) {
      return res.status(422).json({ verification, unlocked: false });
    }

    const updatedSession = await completePendingTask({
      userId: req.user!.id,
      sessionId: session.id,
      taskId: pendingTask.id,
      taskName: pendingTask.taskName,
      s3Url
    });

    res.json({
      verification,
      unlocked: true,
      session: toGameSessionDto(updatedSession),
      media: { taskName: pendingTask.taskName, s3Url }
    });
  })
);
