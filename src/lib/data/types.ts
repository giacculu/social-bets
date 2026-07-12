// ─── Data Collection Types ──────────────────────────────────

export interface RawSportData {
  source: DataSource;
  sport: string;
  sportSlug: string;
  league: string;
  leagueSlug: string;
  country?: string;
  events: RawEventData[];
  collectedAt: Date;
}

export interface RawEventData {
  externalId: string;
  homeTeam: string;
  homeTeamSlug?: string;
  awayTeam: string;
  awayTeamSlug?: string;
  startTime: Date;
  status: EventStatusRaw;
  score?: { home: number; away: number };
  markets: RawMarketData[];
  metadata?: Record<string, any>;
}

export interface RawMarketData {
  name: string;
  slug: string;
  type: MarketTypeRaw;
  outcomes: RawOutcomeData[];
}

export interface RawOutcomeData {
  name: string;
  slug: string;
  odds: number;
  probability?: number;
}

// ─── Enums ─────────────────────────────────────────────────

export type DataSource =
  | "the_odds_api"
  | "api_football"
  | "football_data_org"
  | "espn"
  | "flashscore"
  | "api_sports_nba"
  | "api_sports_tennis"
  | "oddsportal"
  | "manual"
  | "internal";

export type EventStatusRaw =
  | "upcoming"
  | "live"
  | "in_play"
  | "halftime"
  | "finished"
  | "cancelled"
  | "postponed"
  | "suspended"
  | "unknown";

export type MarketTypeRaw =
  | "h2h"
  | "spreads"
  | "totals"
  | "match_result"
  | "over_under"
  | "both_teams_score"
  | "handicap"
  | "first_scorer"
  | "correct_score"
  | "double_chance"
  | "draw_no_bet"
  | "clean_sheet"
  | "win_to_nil"
  | "exact_goals"
  | "first_half_result"
  | "second_half_result"
  | "player_props"
  | "custom";

// ─── Source Configuration ──────────────────────────────────

export interface SourceConfig {
  name: DataSource;
  displayName: string;
  baseUrl: string;
  apiKey?: string;
  rateLimit: { requests: number; perSeconds: number };
  sports: string[];
  enabled: boolean;
  priority: number; // higher = preferred
  reliability: number; // 0-1 score
  lastSync?: Date;
  errorCount: number;
  totalSyncs: number;
}

// ─── Pipeline Types ────────────────────────────────────────

export interface PipelineResult {
  source: DataSource;
  sport: string;
  eventsFound: number;
  eventsCreated: number;
  eventsUpdated: number;
  marketsCreated: number;
  outcomesCreated: number;
  errors: string[];
  duration: number;
  timestamp: Date;
}

export interface OddsCalculation {
  impliedProbability: number;
  bookmakerMargin: number;
  fairOdds: number;
  adjustedOdds: number;
  kellyStake: number;
  value: number; // edge vs bookmaker
}

export interface SettlementResult {
  betId: string;
  userId: string;
  stake: number;
  odds: number;
  result: "WIN" | "LOSS" | "PUSH";
  payout: number;
  profit: number;
}

export interface SyncJob {
  id: string;
  source: DataSource;
  sport?: string;
  status: "pending" | "running" | "completed" | "failed";
  startedAt?: Date;
  completedAt?: Date;
  result?: PipelineResult;
  error?: string;
}

// ─── Scraper Interfaces ────────────────────────────────────

export interface ISourceAdapter {
  config: SourceConfig;
  fetchEvents(sport?: string): Promise<RawSportData[]>;
  healthCheck(): Promise<boolean>;
  getRateLimitInfo(): { remaining: number; resetsAt: Date };
}

export interface IOddsEngine {
  calculateFairOdds(outcomes: { name: string; odds: number }[]): OddsCalculation[];
  calculateBookmakerMargin(outcomes: { odds: number }[]): number;
  adjustForMargin(odds: number, targetMargin: number): number;
  detectValueBets(marketOdds: number[], ourProbabilities: number[], outcomeNames: string[]): ValueBet[];
  blendOdds(sources: { odds: number; weight: number }[]): number;
}

export interface ValueBet {
  outcomeName: string;
  bookmakerOdds: number;
  fairOdds: number;
  impliedProbability: number;
  trueProbability: number;
  edge: number;
  kellyFraction: number;
}
