import { prisma } from "@/lib/prisma";
import { cacheGet, cacheSet, cacheDel, cacheDelPattern } from "@/lib/redis";

export class UserRepository {
  async findById(id: string) {
    const cached = await cacheGet<any>(`user:${id}`);
    if (cached) return cached;
    const user = await prisma.user.findUnique({ where: { id } });
    if (user) await cacheSet(`user:${id}`, user, 300);
    return user;
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findByUsername(username: string) {
    const cached = await cacheGet<any>(`user:username:${username}`);
    if (cached) return cached;
    const user = await prisma.user.findUnique({ where: { username } });
    if (user) await cacheSet(`user:username:${username}`, user, 300);
    return user;
  }

  async findByInviteCode(inviteCode: string) {
    return prisma.user.findFirst({ where: { inviteCode } });
  }

  async create(data: { username: string; email: string; passwordHash: string; name?: string; inviteCode: string; referredBy?: string }) {
    const user = await prisma.user.create({ data });
    await cacheDelPattern("user:*");
    return user;
  }

  async update(id: string, data: any) {
    const user = await prisma.user.update({ where: { id }, data });
    await cacheDel(`user:${id}`);
    await cacheDelPattern("user:username:*");
    return user;
  }

  async count() {
    return prisma.user.count();
  }
}
