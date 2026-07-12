import { z } from "zod";

export const placeBetSchema = z.object({
  eventId: z.string().min(1),
  marketId: z.string().min(1),
  outcomeId: z.string().min(1),
  stake: z.coerce.number().positive().max(100000),
});

export type PlaceBetInput = z.infer<typeof placeBetSchema>;
