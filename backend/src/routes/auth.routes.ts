import bcrypt from "bcryptjs";
import { Router } from "express";
import { authSchema } from "../validation/auth.schemas.js";
import { prisma } from "../lib/prisma.js";
import { AppError, asyncHandler } from "../lib/errors.js";
import { authCookieNames, clearAuthCookies, setAuthCookies, verifyRefreshToken } from "../lib/jwt.js";
import { requireAuth } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { toPublicUser } from "../lib/dto.js";
import { getOnboardingStatus } from "../services/profile.service.js";

export const authRouter = Router();

authRouter.post(
  "/register",
  authLimiter,
  asyncHandler(async (req, res) => {
    const input = authSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new AppError(409, "Email is already registered", "EMAIL_EXISTS");
    }

    const existingPasswordHashes = await prisma.user.findMany({
      select: { password: true }
    });
    const passwordAlreadyUsed = await Promise.any(
      existingPasswordHashes.map(async (user) => {
        if (await bcrypt.compare(input.password, user.password)) {
          return true;
        }
        throw new Error("Password does not match");
      })
    ).catch(() => false);

    if (passwordAlreadyUsed) {
      throw new AppError(409, "Password is already used by another account. Choose a unique password.", "PASSWORD_EXISTS");
    }

    const password = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({
      data: { email: input.email, password },
      select: { id: true, email: true, createdAt: true }
    });

    setAuthCookies(res, user);
    res.status(201).json({ user: toPublicUser(user), onboardingRequired: true });
  })
);

authRouter.post(
  "/login",
  authLimiter,
  asyncHandler(async (req, res) => {
    const input = authSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !(await bcrypt.compare(input.password, user.password))) {
      throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");
    }

    setAuthCookies(res, user);
    const onboarding = await getOnboardingStatus(user.id);
    res.json({
      user: toPublicUser(user),
      onboardingRequired: onboarding.onboardingRequired
    });
  })
);

authRouter.post(
  "/refresh",
  authLimiter,
  asyncHandler(async (req, res) => {
    const token = req.cookies?.[authCookieNames.refreshCookieName];
    if (!token) {
      throw new AppError(401, "Refresh token required", "REFRESH_REQUIRED");
    }

    const payload = verifyRefreshToken(token);
    if (payload.tokenType !== "refresh") {
      throw new AppError(401, "Invalid refresh token", "INVALID_REFRESH_TOKEN");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, createdAt: true }
    });
    if (!user) {
      throw new AppError(401, "User no longer exists", "AUTH_USER_MISSING");
    }

    setAuthCookies(res, user);
    res.json({ user: toPublicUser(user) });
  })
);

authRouter.post("/logout", (_req, res) => {
  clearAuthCookies(res);
  res.status(204).send();
});

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const onboarding = await getOnboardingStatus(req.user!.id);
    res.json({ user: toPublicUser(req.user!), onboardingRequired: onboarding.onboardingRequired });
  })
);
