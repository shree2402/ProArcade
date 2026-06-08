import { z } from "zod";

export const authSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(10).max(128)
});
