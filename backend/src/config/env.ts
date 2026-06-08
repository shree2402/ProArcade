import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: "../.env" });
dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  CLIENT_ORIGIN: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  COOKIE_DOMAIN: z.string().optional().default(""),
  AWS_REGION: z.string().min(1),
  AWS_S3_BUCKET: z.string().min(1),
  BEDROCK_MODEL_ID: z.string().min(1).default("anthropic.claude-3-5-sonnet-20240620-v1:0"),
  STORAGE_DRIVER: z.enum(["local", "s3"]).default("local"),
  VERIFICATION_DRIVER: z.enum(["local", "bedrock"]).default("local"),
  API_PUBLIC_URL: z.string().url().default("http://localhost:4000")
});

export const env = envSchema.parse(process.env);
export const isProduction = env.NODE_ENV === "production";
export const clientOrigins = env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean);
