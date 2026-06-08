import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { clientOrigins } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./lib/errors.js";
import { authRouter } from "./routes/auth.routes.js";
import { profileRouter } from "./routes/profile.routes.js";
import { gameRouter } from "./routes/game.routes.js";
import { galleryRouter } from "./routes/gallery.routes.js";
import { prisma } from "./lib/prisma.js";

export const app = express();

app.set("trust proxy", 1);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || clientOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("CORS origin denied"));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb", strict: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.resolve(fileURLToPath(new URL("../uploads", import.meta.url)))));

app.get("/health", (_req, res) => res.json({ ok: true, service: "productivity-arcade-api" }));
app.get("/health/ready", async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, database: "reachable" });
  } catch (error) {
    next(error);
  }
});
app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.use("/game", gameRouter);
app.use("/gallery", galleryRouter);

app.use(notFoundHandler);
app.use(errorHandler);
