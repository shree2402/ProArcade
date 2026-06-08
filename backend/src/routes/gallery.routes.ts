import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { toMediaGalleryDto } from "../lib/dto.js";

export const galleryRouter = Router();

galleryRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const items = await prisma.mediaGallery.findMany({
      where: { userId: req.user!.id },
      orderBy: { uploadedAt: "desc" }
    });
    res.json({ items: items.map(toMediaGalleryDto) });
  })
);
