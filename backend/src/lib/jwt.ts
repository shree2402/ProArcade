import type { Response } from "express";
import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import { env, isProduction } from "../config/env.js";

export type TokenPayload = {
  sub: string;
  email: string;
  tokenType: "access" | "refresh";
  rotationId?: string;
};

const accessCookieName = "pa_access";
const refreshCookieName = "pa_refresh";

const cookieBase = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ("none" as const) : ("lax" as const),
  path: "/"
};

export function signAccessToken(user: { id: string; email: string }) {
  return jwt.sign({ sub: user.id, email: user.email, tokenType: "access" } satisfies TokenPayload, env.JWT_ACCESS_SECRET, {
    expiresIn: "15m"
  });
}

export function signRefreshToken(user: { id: string; email: string }) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      tokenType: "refresh",
      rotationId: randomUUID()
    } satisfies TokenPayload,
    env.JWT_REFRESH_SECRET,
    { expiresIn: "30d" }
  );
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
}

export function setAuthCookies(res: Response, user: { id: string; email: string }) {
  res.cookie(accessCookieName, signAccessToken(user), {
    ...cookieBase,
    domain: env.COOKIE_DOMAIN || undefined,
    maxAge: 15 * 60 * 1000
  });
  res.cookie(refreshCookieName, signRefreshToken(user), {
    ...cookieBase,
    domain: env.COOKIE_DOMAIN || undefined,
    maxAge: 30 * 24 * 60 * 60 * 1000
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(accessCookieName, { ...cookieBase, domain: env.COOKIE_DOMAIN || undefined });
  res.clearCookie(refreshCookieName, { ...cookieBase, domain: env.COOKIE_DOMAIN || undefined });
}

export const authCookieNames = { accessCookieName, refreshCookieName };
