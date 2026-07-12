import { inngest } from "@/lib/inngest";
import { prisma } from "@/lib/prisma";
import { createChildLogger } from "@/lib/logger";

const log = createChildLogger({ module: "jobs:cleanup" });

export const cleanupIdempotencyKeysFn = inngest.createFunction(
  { id: "cleanup-idempotency", name: "Cleanup Idempotency Keys", triggers: [{ cron: "0 4 * * *" }] },
  async ({ event, step }) => {
    log.info("Cleaning up expired idempotency keys");
    const result = await prisma.idempotencyKey.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    log.info({ deleted: result.count }, "Idempotency cleanup done");
    return { deleted: result.count };
  }
);
