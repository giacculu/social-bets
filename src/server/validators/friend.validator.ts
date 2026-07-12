import { z } from "zod";

export const friendActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("add"), username: z.string().min(1) }),
  z.object({ action: z.literal("accept"), friendshipId: z.string().min(1) }),
  z.object({ action: z.literal("decline"), friendshipId: z.string().min(1) }),
]);

export type FriendActionInput = z.infer<typeof friendActionSchema>;
