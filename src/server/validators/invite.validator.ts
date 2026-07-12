import { z } from "zod";

export const redeemInviteSchema = z.object({ action: z.literal("redeem"), inviteCode: z.string().min(1) });

export type RedeemInviteInput = z.infer<typeof redeemInviteSchema>;
