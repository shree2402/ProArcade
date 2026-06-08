import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import { ZodError } from "zod";

const { JsonWebTokenError, TokenExpiredError } = jwt;

type AwsLikeError = Error & {
  name?: string;
  Code?: string;
  code?: string;
  $metadata?: {
    httpStatusCode?: number;
  };
};

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code = "APP_ERROR"
  ) {
    super(message);
  }
}

export const asyncHandler =
  <T extends Request>(fn: (req: T, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: T, res: Response, next: NextFunction) => {
    void fn(req, res, next).catch(next);
  };

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(404, `Route not found: ${req.method} ${req.path}`, "NOT_FOUND"));
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed",
      code: "VALIDATION_ERROR",
      details: error.flatten()
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
      code: error.code
    });
  }

  if (error instanceof TokenExpiredError) {
    return res.status(401).json({
      error: "Authentication token expired",
      code: "TOKEN_EXPIRED"
    });
  }

  if (error instanceof JsonWebTokenError) {
    return res.status(401).json({
      error: "Invalid authentication token",
      code: "INVALID_TOKEN"
    });
  }

  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      error: error.message,
      code: error.code
    });
  }

  const maybeAwsError = error as AwsLikeError;
  const awsErrorName = maybeAwsError.name ?? maybeAwsError.Code ?? maybeAwsError.code;
  if (awsErrorName) {
    if (["CredentialsProviderError", "ProviderError"].includes(awsErrorName)) {
      return res.status(503).json({
        error: "AWS credentials are not configured. Run aws configure or set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_REGION.",
        code: "AWS_CREDENTIALS_MISSING"
      });
    }

    if (["AccessDenied", "AccessDeniedException", "UnauthorizedOperation"].includes(awsErrorName)) {
      return res.status(403).json({
        error: "AWS access denied. Check IAM permissions for S3 PutObject and Bedrock InvokeModel.",
        code: "AWS_ACCESS_DENIED"
      });
    }

    if (["NoSuchBucket", "ResourceNotFoundException", "ValidationException"].includes(awsErrorName)) {
      return res.status(404).json({
        error: maybeAwsError.message,
        code: "AWS_RESOURCE_NOT_FOUND"
      });
    }

    const awsStatus = maybeAwsError.$metadata?.httpStatusCode;
    if (awsStatus && awsStatus >= 400) {
      return res.status(502).json({
        error: maybeAwsError.message,
        code: "AWS_SERVICE_ERROR"
      });
    }
  }

  console.error(error);
  return res.status(500).json({
    error: "Internal server error",
    code: "INTERNAL_SERVER_ERROR"
  });
}
