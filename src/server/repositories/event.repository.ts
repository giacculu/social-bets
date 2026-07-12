import { prisma } from "@/lib/prisma";
import { cacheGet, cacheSet, cacheDel, cacheDelPattern } from "@/lib/redis";

export class EventRepository {
  async findById(id: string) {
    const cached = await cacheGet<any>(`event:${id}`);
    if (cached) return cached;
    const event = await prisma.event.findUnique({ where: { id }, include: { markets: { include: { outcomes: true } }, league: true } });
    if (event) await cacheSet(`event:${id}`, event, 300);
    return event;
  }

  async findBySlug(slug: string) {
    const cached = await cacheGet<any>(`event:slug:${slug}`);
    if (cached) return cached;
    const event = await prisma.event.findFirst({ where: { slug }, include: { markets: { include: { outcomes: true } }, league: true } });
    if (event) await cacheSet(`event:slug:${slug}`, event, 300);
    return event;
  }

  async findUpcoming(sportSlug?: string, limit = 50) {
    const key = `events:upcoming:${sportSlug || "all"}`;
    const cached = await cacheGet<any[]>(key);
    if (cached) return cached;
    const where: any = { status: "UPCOMING" };
    if (sportSlug) where.league = { sport: { slug: sportSlug } };
    const events = await prisma.event.findMany({ where, include: { league: true }, orderBy: { startTime: "asc" }, take: limit });
    await cacheSet(key, events, 120);
    return events;
  }

  async findLive() {
    const cached = await cacheGet<any[]>("events:live");
    if (cached) return cached;
    const events = await prisma.event.findMany({ where: { status: "LIVE" }, include: { league: true }, orderBy: { startTime: "asc" } });
    await cacheSet("events:live", events, 30);
    return events;
  }

  async count() {
    return prisma.event.count();
  }

  async countByStatus(status: string) {
    return prisma.event.count({ where: { status: status as any } });
  }

  async create(data: any) {
    const event = await prisma.event.create({ data });
    await cacheDelPattern("event:*");
    await cacheDelPattern("events:*");
    return event;
  }

  async update(id: string, data: any) {
    const event = await prisma.event.update({ where: { id }, data });
    await cacheDel(`event:${id}`);
    await cacheDelPattern("event:*");
    await cacheDelPattern("events:*");
    return event;
  }

  async delete(id: string) {
    const event = await prisma.event.delete({ where: { id } });
    await cacheDel(`event:${id}`);
    await cacheDelPattern("event:*");
    await cacheDelPattern("events:*");
    return event;
  }
}
