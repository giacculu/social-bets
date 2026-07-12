import { BaseSourceAdapter } from "./base";
import { RawSportData, RawEventData } from "../types";

/**
 * Football-Data.org Adapter
 * https://www.football-data.org/
 * 
 * Free tier: 10 requests/min
 * Covers: Major European leagues + international
 * Data: Match results, fixtures, standings
 */
export class FootballDataAdapter extends BaseSourceAdapter {
  private static readonly COMPETITIONS: Record<string, string> = {
    "serie-a": "SA",
    "premier-league": "PL",
    "la-liga": "PD",
    "bundesliga": "BL1",
    "ligue-1": "FL1",
    "champions-league": "CL",
    "eredivisie": "DED",
    "primeira-liga": "PPL",
    "championship": "ELC",
  };

  constructor(apiKey?: string) {
    super({
      name: "football_data_org",
      displayName: "Football-Data.org",
      baseUrl: "https://api.football-data.org/v4",
      apiKey,
      rateLimit: { requests: 10, perSeconds: 60 },
      sports: ["calcio"],
      enabled: !!apiKey,
      priority: 8,
      reliability: 0.92,
      errorCount: 0,
      totalSyncs: 0,
    });
  }

  async fetchEvents(sport?: string): Promise<RawSportData[]> {
    if (!this.config.apiKey) {
      throw new Error("Football-Data.org API key not configured");
    }

    const results: RawSportData[] = [];

    const competitions = Object.entries(FootballDataAdapter.COMPETITIONS);

    for (const [slug, code] of competitions) {
      try {
        const data = await this.fetchCompetition(code, slug);
        if (data) results.push(data);
        await this.delay(7000); // Respect rate limit (10/min)
      } catch (error) {
        console.error(`[FootballData] Error fetching ${slug}:`, error);
      }
    }

    return results;
  }

  private async fetchCompetition(
    code: string,
    slug: string
  ): Promise<RawSportData | null> {
    const url = `${this.config.baseUrl}/competitions/${code}/matches?status=SCHEDULED,IN_PLAY,FINISHED`;
    const data = await this.fetch(url, {
      headers: { "X-Auth-Token": this.config.apiKey! },
    });

    if (!data?.matches) return null;

    const events: RawEventData[] = data.matches
      .filter((m: any) => m.status !== "TIMED")
      .map((match: any) => ({
        externalId: `fd-${match.id}`,
        homeTeam: match.homeTeam.shortName || match.homeTeam.name,
        awayTeam: match.awayTeam.shortName || match.awayTeam.name,
        homeTeamSlug: this.slugify(
          match.homeTeam.shortName || match.homeTeam.name
        ),
        awayTeamSlug: this.slugify(
          match.awayTeam.shortName || match.awayTeam.name
        ),
        startTime: new Date(match.utcDate),
        status: this.mapStatus(match.status),
        score: match.score?.fullTime?.home !== null
          ? {
              home: match.score.fullTime.home || 0,
              away: match.score.fullTime.away || 0,
            }
          : undefined,
        markets: this.generateMarkets(match),
        metadata: {
          matchday: match.matchday,
          stage: match.stage,
          group: match.group,
          referee: match.referees?.[0]?.name,
          venue: match.venue,
        },
      }));

    const competitionName = this.getCompetitionName(code);

    return {
      source: "football_data_org",
      sport: "Calcio",
      sportSlug: "calcio",
      league: competitionName,
      leagueSlug: slug,
      country: this.getCountry(code),
      events,
      collectedAt: new Date(),
    };
  }

  private generateMarkets(match: any): any[] {
    const markets: any[] = [];

    // Generate match result odds using rating system
    const homeStrength = this.getTeamStrength(match.homeTeam);
    const awayStrength = this.getTeamStrength(match.awayTeam);

    // H2H market
    const h2h = this.calculateSimpleOdds(homeStrength, awayStrength);
    markets.push({
      name: "Risultato Finale",
      slug: "match-result",
      type: "MATCH_RESULT",
      outcomes: [
        { name: match.homeTeam.shortName || match.homeTeam.name, slug: "home", odds: h2h.home },
        { name: "Pareggio", slug: "draw", odds: h2h.draw },
        { name: match.awayTeam.shortName || match.awayTeam.name, slug: "away", odds: h2h.away },
      ],
    });

    // Over/Under 2.5
    const expectedGoals = this.estimateGoals(homeStrength, awayStrength);
    const overUnder = this.calculateOverUnder(expectedGoals);
    markets.push({
      name: "Oltre/Sotto 2.5",
      slug: "over-under-2-5",
      type: "OVER_UNDER",
      outcomes: [
        { name: "Oltre 2.5", slug: "over", odds: overUnder.over },
        { name: "Sotto 2.5", slug: "under", odds: overUnder.under },
      ],
    });

    // BTTS
    const btts = this.calculateBTTS(expectedGoals);
    markets.push({
      name: "Entrambe Segnano",
      slug: "btts",
      type: "BOTH_TEAMS_SCORE",
      outcomes: [
        { name: "Sì", slug: "yes", odds: btts.yes },
        { name: "No", slug: "no", odds: btts.no },
      ],
    });

    return markets;
  }

  private getTeamStrength(team: any): number {
    // Simplified strength rating based on available data
    // In production, this would use historical data, ELO, etc.
    const name = team.shortName || team.name;
    const strong: Record<string, number> = {
      "Man City": 95, "Arsenal": 92, "Liverpool": 91, "Chelsea": 88,
      "Inter": 90, "Milan": 84, "Juventus": 86, "Napoli": 89,
      "Barcelona": 93, "Real Madrid": 95, "Bayern": 94,
      "PSG": 90, "Dortmund": 87,
    };
    return strong[name] || 75 + Math.random() * 10;
  }

  private calculateSimpleOdds(
    homeStrength: number,
    awayStrength: number
  ): { home: number; draw: number; away: number } {
    const total = homeStrength + awayStrength;
    const homeProb = (homeStrength / total) * 0.85 + 0.05;
    const awayProb = (awayStrength / total) * 0.85 + 0.05;
    const drawProb = 1 - homeProb - awayProb;

    return {
      home: this.roundOdds(1 / Math.max(homeProb, 0.05)),
      draw: this.roundOdds(1 / Math.max(drawProb, 0.05)),
      away: this.roundOdds(1 / Math.max(awayProb, 0.05)),
    };
  }

  private calculateOverUnder(expectedGoals: number): { over: number; under: number } {
    const lambda = expectedGoals;
    let pOver = 0;
    for (let k = 3; k <= 10; k++) {
      pOver += (Math.pow(lambda, k) * Math.exp(-lambda)) / this.factorial(k);
    }
    return {
      over: this.roundOdds(1 / Math.max(pOver, 0.05)),
      under: this.roundOdds(1 / Math.max(1 - pOver, 0.05)),
    };
  }

  private calculateBTTS(expectedGoals: number): { yes: number; no: number } {
    const homeExpected = expectedGoals * 0.55;
    const awayExpected = expectedGoals * 0.45;
    const pBothScore =
      (1 - Math.exp(-homeExpected)) * (1 - Math.exp(-awayExpected));
    return {
      yes: this.roundOdds(1 / Math.max(pBothScore, 0.05)),
      no: this.roundOdds(1 / Math.max(1 - pBothScore, 0.05)),
    };
  }

  private estimateGoals(homeStr: number, awayStr: number): number {
    // Average goals in top leagues ~2.7
    const avgGoals = 2.7;
    const factor = (homeStr + awayStr) / 190;
    return avgGoals * factor;
  }

  private mapStatus(status: string): string {
    const map: Record<string, string> = {
      SCHEDULED: "upcoming",
      TIMED: "upcoming",
      IN_PLAY: "live",
      PAUSED: "live",
      FINISHED: "finished",
      POSTPONED: "postponed",
      CANCELLED: "cancelled",
      AWARDED: "finished",
    };
    return map[status] || "unknown";
  }

  private getCompetitionName(code: string): string {
    const names: Record<string, string> = {
      SA: "Serie A",
      PL: "Premier League",
      PD: "La Liga",
      BL1: "Bundesliga",
      FL1: "Ligue 1",
      CL: "Champions League",
      DED: "Eredivisie",
      PPL: "Primeira Liga",
      ELC: "Championship",
    };
    return names[code] || code;
  }

  private getCountry(code: string): string {
    const countries: Record<string, string> = {
      SA: "🇮🇹 Italia",
      PL: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inghilterra",
      PD: "🇪🇸 Spagna",
      BL1: "🇩🇪 Germania",
      FL1: "🇫🇷 Francia",
      CL: "🌍 Europa",
    };
    return countries[code] || "";
  }

  private factorial(n: number): number {
    if (n <= 1) return 1;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  }

  private roundOdds(odds: number): number {
    if (odds < 1.01) return 1.01;
    if (odds < 2) return Math.round(odds * 100) / 100;
    if (odds < 5) return Math.round(odds * 50) / 50;
    return Math.round(odds * 20) / 20;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async healthCheck(): Promise<boolean> {
    if (!this.config.apiKey) return false;
    try {
      await this.fetch(`${this.config.baseUrl}/competitions`, {
        headers: { "X-Auth-Token": this.config.apiKey },
      });
      return true;
    } catch {
      return false;
    }
  }
}
