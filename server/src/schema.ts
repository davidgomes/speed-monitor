
import { z } from 'zod';

// Speed test result schema
export const speedTestResultSchema = z.object({
  id: z.number(),
  download_speed: z.number(), // Mbps
  upload_speed: z.number(), // Mbps
  ping: z.number(), // ms
  timestamp: z.coerce.date()
});

export type SpeedTestResult = z.infer<typeof speedTestResultSchema>;

// Input schema for creating speed test results
export const createSpeedTestInputSchema = z.object({
  download_speed: z.number().positive(),
  upload_speed: z.number().positive(),
  ping: z.number().nonnegative()
});

export type CreateSpeedTestInput = z.infer<typeof createSpeedTestInputSchema>;

// Current speeds response schema
export const currentSpeedsSchema = z.object({
  download_speed: z.number(),
  upload_speed: z.number(),
  ping: z.number(),
  last_updated: z.coerce.date()
});

export type CurrentSpeeds = z.infer<typeof currentSpeedsSchema>;
