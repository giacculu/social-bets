import { PrismaClient } from "./src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Sports
  const football = await prisma.sport.upsert({
    where: { slug: "calcio" },
    update: {},
    create: { name: "Calcio", slug: "calcio", icon: "⚽" },
  });

  const basketball = await prisma.sport.upsert({
    where: { slug: "basketball" },
    update: {},
    create: { name: "Basketball", slug: "basketball", icon: "🏀" },
  });

  const tennis = await prisma.sport.upsert({
    where: { slug: "tennis" },
    update: {},
    create: { name: "Tennis", slug: "tennis", icon: "🎾" },
  });

  const mma = await prisma.sport.upsert({
    where: { slug: "mma" },
    update: {},
    create: { name: "MMA", slug: "mma", icon: "🥊" },
  });

  console.log("✅ Sports created");

  // Leagues
  const serieA = await prisma.league.upsert({
    where: { sportId_slug: { sportId: football.id, slug: "serie-a" } },
    update: {},
    create: {
      sportId: football.id,
      name: "Serie A",
      slug: "serie-a",
      country: "🇮🇹 Italia",
    },
  });

  const premierLeague = await prisma.league.upsert({
    where: { sportId_slug: { sportId: football.id, slug: "premier-league" } },
    update: {},
    create: {
      sportId: football.id,
      name: "Premier League",
      slug: "premier-league",
      country: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inghilterra",
    },
  });

  const championsLeague = await prisma.league.upsert({
    where: { sportId_slug: { sportId: football.id, slug: "champions-league" } },
    update: {},
    create: {
      sportId: football.id,
      name: "Champions League",
      slug: "champions-league",
      country: "🌍 Europa",
    },
  });

  const nba = await prisma.league.upsert({
    where: { sportId_slug: { sportId: basketball.id, slug: "nba" } },
    update: {},
    create: {
      sportId: basketball.id,
      name: "NBA",
      slug: "nba",
      country: "🇺🇸 USA",
    },
  });

  const atp = await prisma.league.upsert({
    where: { sportId_slug: { sportId: tennis.id, slug: "atp" } },
    update: {},
    create: {
      sportId: tennis.id,
      name: "ATP Tour",
      slug: "atp",
      country: "🌍 Internazionale",
    },
  });

  const ufc = await prisma.league.upsert({
    where: { sportId_slug: { sportId: mma.id, slug: "ufc" } },
    update: {},
    create: {
      sportId: mma.id,
      name: "UFC",
      slug: "ufc",
      country: "🇺🇸 USA",
    },
  });

  console.log("✅ Leagues created");

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Serie A Events
  const events = [
    // Serie A
    {
      leagueId: serieA.id,
      homeTeamName: "Inter",
      awayTeamName: "Milan",
      startTime: tomorrow,
      markets: [
        {
          name: "Risultato Finale",
          slug: "match-result",
          type: "MATCH_RESULT" as const,
          outcomes: [
            { name: "Inter", slug: "home", odds: 1.85 },
            { name: "Pareggio", slug: "draw", odds: 3.5 },
            { name: "Milan", slug: "away", odds: 4.0 },
          ],
        },
        {
          name: "Oltre/Sotto 2.5",
          slug: "over-under-2-5",
          type: "OVER_UNDER" as const,
          outcomes: [
            { name: "Oltre 2.5", slug: "over", odds: 1.75 },
            { name: "Sotto 2.5", slug: "under", odds: 2.05 },
          ],
        },
      ],
    },
    {
      leagueId: serieA.id,
      homeTeamName: "Juventus",
      awayTeamName: "Napoli",
      startTime: dayAfter,
      markets: [
        {
          name: "Risultato Finale",
          slug: "match-result",
          type: "MATCH_RESULT" as const,
          outcomes: [
            { name: "Juventus", slug: "home", odds: 2.3 },
            { name: "Pareggio", slug: "draw", odds: 3.2 },
            { name: "Napoli", slug: "away", odds: 3.1 },
          ],
        },
      ],
    },
    {
      leagueId: serieA.id,
      homeTeamName: "Roma",
      awayTeamName: "Lazio",
      startTime: nextWeek,
      markets: [
        {
          name: "Risultato Finale",
          slug: "match-result",
          type: "MATCH_RESULT" as const,
          outcomes: [
            { name: "Roma", slug: "home", odds: 2.1 },
            { name: "Pareggio", slug: "draw", odds: 3.3 },
            { name: "Lazio", slug: "away", odds: 3.4 },
          ],
        },
        {
          name: "Entrambe Segnano",
          slug: "btts",
          type: "BOTH_TEAMS_SCORE" as const,
          outcomes: [
            { name: "Sì", slug: "yes", odds: 1.8 },
            { name: "No", slug: "no", odds: 1.95 },
          ],
        },
      ],
    },
    // Premier League
    {
      leagueId: premierLeague.id,
      homeTeamName: "Arsenal",
      awayTeamName: "Chelsea",
      startTime: tomorrow,
      markets: [
        {
          name: "Risultato Finale",
          slug: "match-result",
          type: "MATCH_RESULT" as const,
          outcomes: [
            { name: "Arsenal", slug: "home", odds: 1.65 },
            { name: "Pareggio", slug: "draw", odds: 3.8 },
            { name: "Chelsea", slug: "away", odds: 4.8 },
          ],
        },
      ],
    },
    {
      leagueId: premierLeague.id,
      homeTeamName: "Liverpool",
      awayTeamName: "Man City",
      startTime: dayAfter,
      markets: [
        {
          name: "Risultato Finale",
          slug: "match-result",
          type: "MATCH_RESULT" as const,
          outcomes: [
            { name: "Liverpool", slug: "home", odds: 2.2 },
            { name: "Pareggio", slug: "draw", odds: 3.4 },
            { name: "Man City", slug: "away", odds: 3.0 },
          ],
        },
        {
          name: "Handicap -1",
          slug: "handicap-1",
          type: "HANDICAP" as const,
          outcomes: [
            { name: "Liverpool -1", slug: "home-1", odds: 3.2 },
            { name: "Man City +1", slug: "away+1", odds: 1.35 },
          ],
        },
      ],
    },
    // Champions League
    {
      leagueId: championsLeague.id,
      homeTeamName: "Barcelona",
      awayTeamName: "Bayern Monaco",
      startTime: nextWeek,
      markets: [
        {
          name: "Risultato Finale",
          slug: "match-result",
          type: "MATCH_RESULT" as const,
          outcomes: [
            { name: "Barcelona", slug: "home", odds: 2.0 },
            { name: "Pareggio", slug: "draw", odds: 3.5 },
            { name: "Bayern", slug: "away", odds: 3.3 },
          ],
        },
      ],
    },
    // NBA
    {
      leagueId: nba.id,
      homeTeamName: "LA Lakers",
      awayTeamName: "Boston Celtics",
      startTime: tomorrow,
      markets: [
        {
          name: "Vincitore",
          slug: "match-winner",
          type: "MATCH_RESULT" as const,
          outcomes: [
            { name: "Lakers", slug: "home", odds: 2.1 },
            { name: "Celtics", slug: "away", odds: 1.75 },
          ],
        },
        {
          name: "Oltre/Sotto 215.5",
          slug: "over-under-215",
          type: "OVER_UNDER" as const,
          outcomes: [
            { name: "Oltre 215.5", slug: "over", odds: 1.9 },
            { name: "Sotto 215.5", slug: "under", odds: 1.9 },
          ],
        },
      ],
    },
    // Tennis
    {
      leagueId: atp.id,
      homeTeamName: "C. Alcaraz",
      awayTeamName: "J. Sinner",
      startTime: nextWeek,
      markets: [
        {
          name: "Vincitore Partita",
          slug: "match-winner",
          type: "MATCH_RESULT" as const,
          outcomes: [
            { name: "Alcaraz", slug: "home", odds: 1.9 },
            { name: "Sinner", slug: "away", odds: 1.95 },
          ],
        },
      ],
    },
    // UFC
    {
      leagueId: ufc.id,
      homeTeamName: "Islam Makhachev",
      awayTeamName: "Charles Oliveira",
      startTime: nextWeek,
      markets: [
        {
          name: "Vincitore",
          slug: "match-winner",
          type: "MATCH_RESULT" as const,
          outcomes: [
            { name: "Makhachev", slug: "home", odds: 1.35 },
            { name: "Oliveira", slug: "away", odds: 3.2 },
          ],
        },
        {
          name: "Metodo",
          slug: "method",
          type: "CUSTOM" as const,
          outcomes: [
            { name: "KO/TKO", slug: "ko", odds: 4.5 },
            { name: "Sottomissione", slug: "sub", odds: 3.8 },
            { name: "Decisione", slug: "decision", odds: 2.5 },
          ],
        },
      ],
    },
  ];

  for (const eventData of events) {
    const event = await prisma.event.create({
      data: {
        leagueId: eventData.leagueId,
        homeTeamName: eventData.homeTeamName,
        awayTeamName: eventData.awayTeamName,
        startTime: eventData.startTime,
        status: "UPCOMING",
      },
    });

    for (const marketData of eventData.markets) {
      const market = await prisma.market.create({
        data: {
          eventId: event.id,
          name: marketData.name,
          slug: marketData.slug,
          type: marketData.type,
          status: "OPEN",
        },
      });

      for (const outcomeData of marketData.outcomes) {
        await prisma.outcome.create({
          data: {
            marketId: market.id,
            name: outcomeData.name,
            slug: outcomeData.slug,
            odds: outcomeData.odds,
            probability: 1 / outcomeData.odds,
          },
        });
      }
    }
  }

  console.log("✅ Events & markets created");
  console.log("🎉 Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
