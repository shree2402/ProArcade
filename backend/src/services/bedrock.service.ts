import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { z } from "zod";
import { env } from "../config/env.js";
import { AppError } from "../lib/errors.js";

export type VerificationResult = {
  verified: boolean;
  reason: string;
  confidence: number;
};

const verificationResultSchema = z.object({
  verified: z.boolean(),
  reason: z.string().min(1).max(500),
  confidence: z.number().min(0).max(1)
});

export const AI_VERIFICATION_SYSTEM_PROMPT = `You are the anti-cheat visual verifier for Productivity Arcade.
Your job is to decide whether a submitted image genuinely proves that the user completed the assigned task.

Be strict. Approve only when the image contains strong visual evidence of the assigned activity or completed output.
Reject images that are unrelated, staged without evidence, blank, low quality, AI-generated, screenshots of only the task text, screenshots of this app, memes, old gallery images, or anything that could not reasonably prove task completion.
For productive tasks, look for concrete evidence of the activity or artifact: notes, workout context, code/editor output, reading material, completed chore, practice log, or similar.
For favorite tasks, verify the image plausibly shows the leisure/reward activity rather than generic objects.
If the task is inherently private or hard to photograph, accept a clear completed artifact or context, but never accept a bare selfie or unrelated screenshot.
Return only valid minified JSON with this exact schema:
{"verified":boolean,"reason":"short concrete explanation","confidence":number}
Confidence must be between 0 and 1.`;

const client = new BedrockRuntimeClient({ region: env.AWS_REGION });

function extractJson(text: string) {
  const trimmed = text.trim();
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new AppError(502, "Bedrock returned a non-JSON verification response", "BEDROCK_BAD_RESPONSE");
  }
  try {
    const parsed = JSON.parse(match[0]) as unknown;
    return verificationResultSchema.parse(parsed);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new AppError(502, "Bedrock returned malformed JSON", "BEDROCK_MALFORMED_JSON");
    }
    throw error;
  }
}

export async function verifyProofWithBedrock(input: {
  imageBuffer: Buffer;
  mimeType: string;
  taskName: string;
  durationMinutes: number;
}) {
  if (env.VERIFICATION_DRIVER === "local") {
    return {
      verified: true,
      reason: `Local development verification accepted this ${input.mimeType} proof for "${input.taskName}". Switch VERIFICATION_DRIVER=bedrock for real AI verification.`,
      confidence: 0.99
    };
  }

  const body = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 300,
    temperature: 0,
    system: AI_VERIFICATION_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Assigned task: "${input.taskName}". Expected duration: ${input.durationMinutes} minutes. Verify whether this image is authentic proof of task completion.`
          },
          {
            type: "image",
            source: {
              type: "base64",
              media_type: input.mimeType,
              data: input.imageBuffer.toString("base64")
            }
          }
        ]
      }
    ]
  };

  const response = await client.send(
    new InvokeModelCommand({
      modelId: env.BEDROCK_MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(body)
    })
  );

  const payload = JSON.parse(Buffer.from(response.body).toString("utf8")) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const text = payload.content?.find((part) => part.type === "text")?.text;
  if (!text) {
    throw new AppError(502, "Bedrock did not return text content", "BEDROCK_EMPTY_RESPONSE");
  }

  let result: VerificationResult;
  try {
    result = extractJson(text);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(502, "Bedrock verification JSON failed schema validation", "BEDROCK_SCHEMA_ERROR");
    }
    throw error;
  }

  if (typeof result.verified !== "boolean" || typeof result.reason !== "string" || typeof result.confidence !== "number") {
    throw new AppError(502, "Bedrock verification JSON failed schema validation", "BEDROCK_SCHEMA_ERROR");
  }

  return {
    verified: result.verified,
    reason: result.reason.slice(0, 500),
    confidence: Math.max(0, Math.min(1, result.confidence))
  };
}
