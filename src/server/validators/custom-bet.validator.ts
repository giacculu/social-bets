import { z } from "zod";

export const createCustomBetSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  stake: z.coerce.number().positive(),
  deadline: z.string(),
  participantUsernames: z.array(z.string().min(1)).min(1).max(20),
});

export type CreateCustomBetInput = z.infer<typeof createCustomBetSchema>;
