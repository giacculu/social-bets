import { z } from "zod";

export const depositSchema = z.object({ amount: z.coerce.number().min(1).max(10000) });
export const withdrawSchema = z.object({ amount: z.coerce.number().positive().max(10000) });

export type DepositInput = z.infer<typeof depositSchema>;
export type WithdrawInput = z.infer<typeof withdrawSchema>;
