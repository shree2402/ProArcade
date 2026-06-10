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

Be extremely strict. Approve only when the image contains strong visual evidence of the assigned activity or completed output.
Reject images that are unrelated, staged without evidence, blank, low quality, AI-generated, screenshots of only the task text, screenshots of this app, memes, old gallery images, or anything that could not reasonably prove task completion.
The visual evidence must match the specific assigned task, not just any productive or hobby activity.
If the assigned task is cleaning, organizing, chores, or tidying, reject images that primarily show reading, drawing, cups, books, screenshots, unrelated desks, or leisure objects unless there is clear visual evidence of cleaning progress, cleaning tools, a cleaned area, or before/after cleaning context.
If the assigned task is reading, reject unrelated cleaning, exercise, food, or generic object photos unless a readable book/article/reading device is visible.
If the assigned task is exercise, reject unrelated sitting, reading, food, or desk images unless workout context/equipment/body movement is visible.
For productive tasks, look for concrete evidence of the exact activity or artifact: notes for studying, workout context for exercise, code/editor output for coding, cleaning tools/cleaned area for chores, practice output for practice tasks, or similar.
For favorite tasks, verify the image plausibly shows the leisure/reward activity rather than generic objects.
If the task is inherently private or hard to photograph, accept a clear completed artifact or context, but never accept a bare selfie or unrelated screenshot.
When uncertain, return verified=false.
Return only valid minified JSON with this exact schema:
{"verified":boolean,"reason":"short concrete explanation","confidence":number}
Confidence must be between 0 and 1.`;

const client = new BedrockRuntimeClient({ region: env.AWS_REGION });

function buildTaskSpecificGuidance(taskName: string) {
  const normalized = taskName.toLowerCase();

  if (/\b(clean|cleaning|tidy|tidying|organize|organizing|declutter|chore|dust|laundry|dishes|sweep|mop|vacuum)\b/.test(normalized)) {
    return "This is a cleaning/chore task. The image must show cleaning evidence such as a cleaned area, cleaning supplies, trash removal, organized items, laundry/dishes progress, or before/after context. Reject reading, drawing, cups, books, or unrelated object photos.";
  }

  if (/\b(read|reading|book|article|study|studying)\b/.test(normalized)) {
    return "This is a reading/study task. The image must show reading/study evidence such as a book, article, notes, study material, or reading device. Reject unrelated cleaning, exercise, or generic object photos.";
  }

  if (/\b(workout|exercise|walk|run|running|yoga|gym|stretch|fitness)\b/.test(normalized)) {
    return "This is an exercise task. The image must show workout evidence such as equipment, exercise setting, workout log, shoes/outdoor walk context, yoga mat, or body movement context. Reject unrelated desk, reading, food, or object photos.";
  }

  if (/\b(code|coding|program|programming|debug|project|build)\b/.test(normalized)) {
    return "This is a coding/build task. The image must show development evidence such as an editor, terminal, code, commit, project output, or implementation artifact. Reject unrelated screenshots or generic desk photos.";
  }

  return "Match the proof to the exact assigned task name. Reject the image if it shows a different activity, even if that other activity is productive.";
}

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
      verified: false,
      reason: `AI verification is currently disabled because VERIFICATION_DRIVER=local. Set VERIFICATION_DRIVER=bedrock and restart the backend to verify proof for "${input.taskName}".`,
      confidence: 0
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
            text: `Assigned task: "${input.taskName}". Expected duration: ${input.durationMinutes} minutes. ${buildTaskSpecificGuidance(input.taskName)} Verify whether this image is authentic proof of this exact task. Return verified=false unless the visual evidence clearly matches the task.`
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

  const normalizedResult = {
    verified: result.verified,
    reason: result.reason.slice(0, 500),
    confidence: Math.max(0, Math.min(1, result.confidence))
  };

  if (normalizedResult.verified && normalizedResult.confidence < 0.85) {
    return {
      verified: false,
      reason: `Rejected because AI confidence was below the required threshold: ${normalizedResult.reason}`,
      confidence: normalizedResult.confidence
    };
  }

  return normalizedResult;
}
