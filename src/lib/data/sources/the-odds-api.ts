import { BaseSourceAdapter } from "./base";
import { RawSportData, RawEventData, SourceConfig } from "../types";
import { createChildLogger } from "@/lib/logger";

const log = createChildLogger({ module: "source:the-odds-api" });

/**
 * The Odds API Adapter
 * https://the-odds-api.com/
 * 
 * Free tier: 500 requests/month
 * Covers: NFL, NBA, MLB, NHL, NCAAF, Soccer, Tennis, MMA, and more
 * Data: Odds from 20+ bookmakers
 */
export class TheOddsApiAdapter extends BaseSourceAdapter {
  private static readonly SPORT_MAP: Record<string, string> = {
    calcio: "soccer_epl",
    football: "soccer_epl",
    basketball: "basketball_nba",
    tennis: "tennis_atp",
    mma: "mma_mixed_martial_arts",
    baseball: "baseball_mlb",
    hockey: "icehockey_nhl",
    football_us: "americanfootball_nfl",
  };

  private static readonly LEAGUE_MAP: Record<string, string> = {
    "premier-league": "soccer_epl",
    "serie-a": "soccer_italy_serie_a",
    "la-liga": "soccer_spain_la_liga",
    "bundesliga": "soccer_germany_bundesliga",
    "ligue-1": "soccer_france_ligue_one",
    "champions-league": "soccer_uefa_champs_league",
    "nba": "basketball_nba",
    "mlb": "baseball_mlb",
    "nhl": "icehockey_nhl",
    "nfl": "americanfootball_nfl",
    "atp": "tennis_atp",
    "ufc": "mma_mixed_martial_ards",
  };

  constructor(apiKey?: string) {
    super({
      name: "the_odds_api",
      displayName: "The Odds API",
      baseUrl: "https://api.the-odds-api.com/v4",
      apiKey,
      rateLimit: { requests: 500, perSeconds: 86400 },
      sports: Object.values(TheOddsApiAdapter.SPORT_MAP),
      enabled: !!apiKey,
      priority: 10,
      reliability: 0.95,
      errorCount: 0,
      totalSyncs: 0,
    });
  }

  async fetchEvents(sport?: string): Promise<RawSportData[]> {
    if (!this.config.apiKey) {
      throw new Error("The Odds API key not configured");
    }

    const results: RawSportData[] = [];

    // If specific sport requested, fetch only that
    const sportsToFetch = sport
      ? [TheOddsApiAdapter.SPORT_MAP[sport] || sport]
      : ["soccer_epl", "soccer_italy_serie_a", "basketball_nba", "tennis_atp", "mma_mixed_martial_ards"];

    for (const sportKey of sportsToFetch) {
      try {
        const data = await this.fetchSportEvents(sportKey);
        if (data) results.push(data);
        await this.delay(1000); // Be nice to the API
      } catch (error) {
        log.error({ sportKey, err: error }, "Error fetching sport");
      }
    }

    return results;
  }

  private async fetchSportEvents(sportKey: string): Promise<RawSportData | null> {
    const url = `${this.config.baseUrl}/sports/${sportKey}/odds/?apiKey=${this.config.apiKey}&regions=eu&markets=h2h,spreads,totals&oddsFormat=decimal`;

    const data = await this.fetch(url);

    if (!data || !Array.isArray(data) || data.length === 0) {
      return null;
    }

    const events: RawEventData[] = data.map((event: any) => ({
      externalId: event.id,
      homeTeam: event.home_team,
      awayTeam: event.away_team,
      startTime: new Date(event.commence_time),
      status: "upcoming" as const,
      metadata: {
        sportKey,
        bookmakers: event.bookmakers?.length || 0,
      },
      markets: this.extractMarkets(event.bookmakers || []),
    }));

    const [sportName, leagueName] = this.parseSportKey(sportKey);

    return {
      source: "the_odds_api",
      sport: sportName,
      sportSlug: this.slugify(sportName),
      league: leagueName,
      leagueSlug: this.slugify(leagueName),
      events,
      collectedAt: new Date(),
    };
  }

  private extractMarkets(bookmakers: any[]): any[] {
    if (bookmakers.length === 0) return [];

    // Blend odds from all bookmakers
    const marketMap = new Map<string, any>();

    for (const bookmaker of bookmakers) {
      for (const market of bookmaker.markets || []) {
        const key = market.key;
        if (!marketMap.has(key)) {
          marketMap.set(key, {
            name: this.marketKeyName(key),
            slug: key,
            type: this.mapMarketType(key),
            outcomes: [],
            allOdds: new Map(),
          });
        }

        const m = marketMap.get(key);
        for (const outcome of market.outcomes || []) {
          if (!m.allOdds.has(outcome.name)) {
            m.allOdds.set(outcome.name, []);
          }
          m.allOdds.get(outcome.name).push(outcome.price);
        }
      }
    }

    // Convert to final format with blended odds
    return Array.from(marketMap.values()).map((m) => ({
      name: m.name,
      slug: m.slug,
      type: m.type,
      outcomes: (Array.from(m.allOdds.entries()) as [string, number[]][]).map(
        ([name, odds]) => ({
          name,
          slug: this.slugify(name),
          odds: this.blendOdds(odds),
          probability: 1 / this.blendOdds(odds),
        })
      ),
    }));
  }

  private blendOdds(oddsArray: number[]): number {
    if (oddsArray.length === 0) return 0;
    if (oddsArray.length === 1) return oddsArray[0];

    // Convert to implied probabilities, average, convert back
    const avgProb =
      oddsArray.reduce((sum, o) => sum + 1 / o, 0) / oddsArray.length;
    return Math.round((1 / avgProb) * 100) / 100;
  }

  private marketKeyName(key: string): string {
    const names: Record<string, string> = {
      h2h: "Risultato Finale",
      spreads: "Handicap",
      totals: "Oltre/Sotto",
    };
    return names[key] || key;
  }

  private mapMarketType(key: string): string {
    const types: Record<string, string> = {
      h2h: "MATCH_RESULT",
      spreads: "HANDICAP",
      totals: "OVER_UNDER",
    };
    return types[key] || "CUSTOM";
  }

  private parseSportKey(key: string): [string, string] {
    const map: Record<string, [string, string]> = {
      soccer_epl: ["Calcio", "Premier League"],
      soccer_italy_serie_a: ["Calcio", "Serie A"],
      soccer_spain_la_liga: ["Calcio", "La Liga"],
      soccer_germany_bundesliga: ["Calcio", "Bundesliga"],
      soccer_france_ligue_one: ["Calcio", "Ligue 1"],
      soccer_uefa_champs_league: ["Calcio", "Champions League"],
      basketball_nba: ["Basketball", "NBA"],
      baseball_mlb: ["Baseball", "MLB"],
      icehockey_nhl: ["Hockey", "NHL"],
      americanfootball_nfl: ["Football Americano", "NFL"],
      tennis_atp: ["Tennis", "ATP Tour"],
      mma_mixed_martial_ards: ["MMA", "UFC"],
    };
    return map[key] || ["Sport", key];
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
      const url = `${this.config.baseUrl}/sports/?apiKey=${this.config.apiKey}`;
      const data = await this.fetch(url);
      return Array.isArray(data);
    } catch {
      return false;
    }
  }
}
