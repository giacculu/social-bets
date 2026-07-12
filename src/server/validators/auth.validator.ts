import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(6).max(128),
  name: z.string().max(50).optional(),
  inviteCode: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
