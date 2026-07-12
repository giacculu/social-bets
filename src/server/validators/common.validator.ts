import { z } from "zod";

export const idParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

export const amountSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive").max(1_000_000),
});

export const stakeSchema = z.object({
  stake: z.coerce.number().positive("Stake must be positive").max(100_000),
});

export const emailSchema = z.string().email("Invalid email address");

export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be at most 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters");

export type PaginationInput = z.infer<typeof paginationSchema>;
export type StakeInput = z.infer<typeof stakeSchema>;
export type AmountInput = z.infer<typeof amountSchema>;
