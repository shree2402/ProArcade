import { AppError } from "./errors.js";

const supportedMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;

export type SupportedImageMimeType = (typeof supportedMimeTypes)[number];

export function isSupportedImageMimeType(mimeType: string): mimeType is SupportedImageMimeType {
  return supportedMimeTypes.includes(mimeType as SupportedImageMimeType);
}

export function assertValidImageFile(file: Express.Multer.File) {
  if (!isSupportedImageMimeType(file.mimetype)) {
    throw new AppError(400, "Only JPEG, PNG, and WebP images are accepted", "INVALID_IMAGE_TYPE");
  }

  const bytes = file.buffer;
  const isJpeg = bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng =
    bytes.length > 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a;
  const isWebp =
    bytes.length > 12 &&
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP";

  const signatureMatches =
    (file.mimetype === "image/jpeg" && isJpeg) ||
    (file.mimetype === "image/png" && isPng) ||
    (file.mimetype === "image/webp" && isWebp);

  if (!signatureMatches) {
    throw new AppError(400, "Uploaded file content does not match its image type", "IMAGE_SIGNATURE_MISMATCH");
  }
}
