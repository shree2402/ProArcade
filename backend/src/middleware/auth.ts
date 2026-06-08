import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AppError, asyncHandler } from "../lib/errors.js";
import { authCookieNames, verifyAccessToken } from "../lib/jwt.js";

export const requireAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies?.[authCookieNames.accessCookieName];
  if (!token) {
    throw new AppError(401, "Authentication required", "AUTH_REQUIRED");
  }

  const payload = verifyAccessToken(token);
  if (payload.tokenType !== "access") {
    throw new AppError(401, "Invalid token", "INVALID_TOKEN");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, createdAt: true }
  });
  if (!user) {
    throw new AppError(401, "User no longer exists", "AUTH_USER_MISSING");
  }

  req.user = user;
  next();
});
