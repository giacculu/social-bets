import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

const sports = [
  {
    name: "Calcio",
    slug: "calcio",
    icon: "⚽",
    leagues: [
      {
        name: "Serie A",
        slug: "serie-a",
        country: "Italia",
        events: [
          { home: "Inter", away: "Milan", days: 3 },
          { home: "Juventus", away: "Napoli", days: 5 },
          { home: "Roma", away: "Lazio", days: 7 },
          { home: "Atalanta", away: "Fiorentina", days: 4 },
          { home: "Bologna", away: "Torino", days: 6 },
          { home: "Genoa", away: "Sampdoria", days: 8 },
          { home: "Cagliari", away: "Lecce", days: 2 },
          { home: "Verona", away: "Parma", days: 10 },
        ],
      },
      {
        name: "Premier League",
        slug: "premier-league",
        country: "Inghilterra",
        events: [
          { home: "Arsenal", away: "Chelsea", days: 3 },
          { home: "Liverpool", away: "Man City", days: 5 },
          { home: "Man United", away: "Tottenham", days: 4 },
          { home: "Newcastle", away: "Aston Villa", days: 7 },
          { home: "Brighton", away: "West Ham", days: 6 },
        ],
      },
      {
        name: "La Liga",
        slug: "la-liga",
        country: "Spagna",
        events: [
          { home: "Real Madrid", away: "Barcelona", days: 4 },
          { home: "Atletico Madrid", away: "Sevilla", days: 6 },
          { home: "Real Sociedad", away: "Athletic Bilbao", days: 5 },
        ],
      },
      {
        name: "Bundesliga",
        slug: "bundesliga",
        country: "Germania",
        events: [
          { home: "Bayern Monaco", away: "Borussia Dortmund", days: 3 },
          { home: "RB Leipzig", away: "Bayer Leverkusen", days: 5 },
          { home: "Eintracht Francoforte", away: "Stoccarda", days: 7 },
        ],
      },
      {
        name: "Ligue 1",
        slug: "ligue-1",
        country: "Francia",
        events: [
          { home: "PSG", away: "Olympique Marsiglia", days: 4 },
          { home: "Lyon", away: "Monaco", days: 6 },
        ],
      },
    ],
  },
  {
    name: "Basket",
    slug: "basket",
    icon: "🏀",
    leagues: [
      {
        name: "NBA",
        slug: "nba",
        country: "USA",
        events: [
          { home: "LA Lakers", away: "Boston Celtics", days: 2 },
          { home: "Golden State Warriors", away: "Miami Heat", days: 3 },
          { home: "Milwaukee Bucks", away: "Phoenix Suns", days: 4 },
          { home: "Dallas Mavericks", away: "Denver Nuggets", days: 5 },
          { home: "Philadelphia 76ers", away: "New York Knicks", days: 2 },
        ],
      },
      {
        name: "Lega Basket Serie A",
        slug: "lba",
        country: "Italia",
        events: [
          { home: "Olimpia Milano", away: "Virtus Bologna", days: 3 },
          { home: "Dinamo Sassari", away: "Reyer Venezia", days: 5 },
        ],
      },
    ],
  },
  {
    name: "Tennis",
    slug: "tennis",
    icon: "🎾",
    leagues: [
      {
        name: "ATP Tour",
        slug: "atp",
        country: "Mondo",
        events: [
          { home: "C. Alcaraz", away: "J. Sinner", days: 7 },
          { home: "N. Djokovic", away: "D. Medvedev", days: 5 },
          { home: "A. Zverev", away: "C. Ruud", days: 6 },
        ],
      },
      {
        name: "WTA Tour",
        slug: "wta",
        country: "Mondo",
        events: [
          { home: "I. Swiatek", away: "A. Sabalenka", days: 4 },
          { home: "C. Gauff", away: "E. Rybakina", days: 6 },
        ],
      },
    ],
  },
  {
    name: "F1",
    slug: "f1",
    icon: "🏎️",
    leagues: [
      {
        name: "Campionato Mondiale",
        slug: "f1-world",
        country: "Mondo",
        events: [
          { home: "M. Verstappen", away: "L. Hamilton", days: 10 },
          { home: "C. Leclerc", away: "L. Norris", days: 14 },
        ],
      },
    ],
  },
  {
    name: "MMA",
    slug: "mma",
    icon: "🥊",
    leagues: [
      {
        name: "UFC",
        slug: "ufc",
        country: "Mondo",
        events: [
          { home: "I. Adesanya", away: "A. Pereira", days: 8 },
          { home: "C. Oliveira", away: "J. Gaethje", days: 12 },
        ],
      },
    ],
  },
];

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(20, 0, 0, 0);
  return d;
}

async function main() {
  console.log("Seeding database...");

  // Create sports, leagues, events, markets, outcomes
  for (const sportData of sports) {
    const sport = await prisma.sport.upsert({
      where: { slug: sportData.slug },
      update: {},
      create: { name: sportData.name, slug: sportData.slug, icon: sportData.icon },
    });

    for (const leagueData of sportData.leagues) {
      const league = await prisma.league.upsert({
        where: { sportId_slug: { sportId: sport.id, slug: leagueData.slug } },
        update: {},
        create: {
          sportId: sport.id,
          name: leagueData.name,
          slug: leagueData.slug,
          country: leagueData.country,
        },
      });

      for (const eventData of leagueData.events) {
        const homeSlug = eventData.home.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        const awaySlug = eventData.away.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        const eventSlug = `${homeSlug}-vs-${awaySlug}`;
        const extId = `seed-${eventSlug}`;

        const existing = await prisma.event.findUnique({ where: { externalId: extId } });
        if (existing) continue;

        const event = await prisma.event.create({
          data: {
            leagueId: league.id,
            externalId: extId,
            homeTeamName: eventData.home,
            awayTeamName: eventData.away,
            startTime: daysFromNow(eventData.days),
            status: "UPCOMING",
            slug: eventSlug,
          },
        });

        // Match Result market
        const matchResult = await prisma.market.create({
          data: {
            eventId: event.id,
            name: "Risultato Finale",
            slug: "match-result",
            type: "MATCH_RESULT",
            status: "OPEN",
          },
        });

        await prisma.outcome.createMany({
          data: [
            { marketId: matchResult.id, name: eventData.home, slug: "home", odds: 2.1 },
            { marketId: matchResult.id, name: "Pareggio", slug: "draw", odds: 3.3 },
            { marketId: matchResult.id, name: eventData.away, slug: "away", odds: 3.1 },
          ],
        });

        // Over/Under 2.5
        const overUnder = await prisma.market.create({
          data: {
            eventId: event.id,
            name: "Gol O/U 2.5",
            slug: "over-under-25",
            type: "OVER_UNDER",
            status: "OPEN",
          },
        });

        await prisma.outcome.createMany({
          data: [
            { marketId: overUnder.id, name: "Oltre 2.5", slug: "over", odds: 1.85 },
            { marketId: overUnder.id, name: "Sotto 2.5", slug: "under", odds: 1.95 },
          ],
        });

        // Both Teams Score
        const btts = await prisma.market.create({
          data: {
            eventId: event.id,
            name: "Entrambe Segnano",
            slug: "btts",
            type: "BOTH_TEAMS_SCORE",
            status: "OPEN",
          },
        });

        await prisma.outcome.createMany({
          data: [
            { marketId: btts.id, name: "Sì", slug: "yes", odds: 1.75 },
            { marketId: btts.id, name: "No", slug: "no", odds: 2.05 },
          ],
        });
      }
    }
  }

  // Create admin user
  const bcrypt = await import("bcryptjs");
  const adminHash = await bcrypt.hash("admin123", 12);
  const adminInvite = "ADMIN2024";

  await prisma.user.upsert({
    where: { email: "admin@socialbets.com" },
    update: {},
    create: {
      email: "admin@socialbets.com",
      username: "admin",
      name: "Admin",
      passwordHash: adminHash,
      balance: 100000,
      inviteCode: adminInvite,
    },
  });

  // Create demo users
  const demoUsers = [
    { username: "marco", email: "marco@demo.com", name: "Marco" },
    { username: "luca", email: "luca@demo.com", name: "Luca" },
    { username: "giulia", email: "giulia@demo.com", name: "Giulia" },
  ];

  for (const u of demoUsers) {
    const hash = await bcrypt.hash("password123", 12);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        username: u.username,
        name: u.name,
        passwordHash: hash,
        balance: 10000,
        inviteCode: u.username.toUpperCase() + Math.random().toString(36).slice(2, 8).toUpperCase(),
      },
    });
  }

  console.log("Seed completed!");
  const sportCount = await prisma.sport.count();
  const eventCount = await prisma.event.count();
  const marketCount = await prisma.market.count();
  console.log(`  Sports: ${sportCount}, Events: ${eventCount}, Markets: ${marketCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
