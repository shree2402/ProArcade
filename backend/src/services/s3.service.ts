import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "../config/env.js";

const s3 = new S3Client({ region: env.AWS_REGION });
const uploadRoot = path.resolve(fileURLToPath(new URL("../../uploads", import.meta.url)));

export async function uploadProofToS3(input: {
  userId: string;
  sessionId: string;
  file: Express.Multer.File;
}) {
  const extension = input.file.mimetype === "image/png" ? "png" : input.file.mimetype === "image/webp" ? "webp" : "jpg";
  const key = `proofs/${input.userId}/${input.sessionId}/${Date.now()}-${randomUUID()}.${extension}`;

  if (env.STORAGE_DRIVER === "local") {
    const fullPath = path.join(uploadRoot, key);
    await mkdir(path.dirname(fullPath), { recursive: true });
    await writeFile(fullPath, input.file.buffer);
    return `${env.API_PUBLIC_URL}/uploads/${key}`;
  }

  await s3.send(
    new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
      Body: input.file.buffer,
      ContentType: input.file.mimetype,
      ServerSideEncryption: "AES256"
    })
  );

  return `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
}
