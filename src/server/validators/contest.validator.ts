import { z } from "zod";

export const contestActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("create"), title: z.string().min(1).max(100), description: z.string().max(500).optional(), entryFee: z.coerce.number().min(1), maxPlayers: z.coerce.number().min(2).max(100).optional(), startTime: z.string(), endTime: z.string(), eventId: z.string().optional() }),
  z.object({ action: z.literal("join"), contestId: z.string().min(1) }),
  z.object({ action: z.literal("leave"), contestId: z.string().min(1) }),
]);

export type ContestActionInput = z.infer<typeof contestActionSchema>;
