import { z } from "zod";

const favoriteTaskSchema = z.object({
  name: z.string().trim().min(2).max(80),
  durationMinutes: z.number().int().min(5).max(30)
});

const productiveTaskSchema = z.object({
  name: z.string().trim().min(2).max(80),
  durationMinutes: z.number().int().min(30).max(120)
});

export const taskPreferencesSchema = z.object({
  favoriteTasks: z.array(favoriteTaskSchema).min(3).max(20),
  productiveTasks: z.array(productiveTaskSchema).min(3).max(20)
});
