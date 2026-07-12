import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const query = q.toLowerCase();

  const [users, events, contests] = await Promise.all([
    prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
        ],
        deletedAt: null,
      },
      select: { id: true, username: true, name: true, avatarUrl: true },
      take: 5,
    }),
    prisma.event.findMany({
      where: {
        OR: [
          { homeTeamName: { contains: query, mode: "insensitive" } },
          { awayTeamName: { contains: query, mode: "insensitive" } },
        ],
        status: { in: ["UPCOMING", "LIVE"] },
      },
      include: { league: { select: { slug: true, sport: { select: { slug: true } } } } },
      take: 5,
    }),
    prisma.contest.findMany({
      where: {
        title: { contains: query, mode: "insensitive" },
        status: { in: ["OPEN", "LOCKED"] },
      },
      select: { id: true, title: true, status: true },
      take: 5,
    }),
  ]);

  const results = [
    ...users.map((u) => ({
      type: "user" as const,
      id: u.id,
      title: u.name || u.username,
      subtitle: `@${u.username}`,
      href: `/profile/${u.username}`,
    })),
    ...events.map((e) => ({
      type: "event" as const,
      id: e.id,
      title: `${e.homeTeamName} vs ${e.awayTeamName}`,
      subtitle: `${e.league.sport.slug} · ${e.league.slug}`,
      href: `/sports/${e.league.sport.slug}/${e.league.slug}?event=${e.id}`,
    })),
    ...contests.map((c) => ({
      type: "contest" as const,
      id: c.id,
      title: c.title,
      subtitle: c.status,
      href: `/contests/${c.id}`,
    })),
  ];

  return NextResponse.json({ results });
}
