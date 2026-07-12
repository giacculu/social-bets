import { ISourceAdapter, RawSportData, SourceConfig } from "../types";

/**
 * Base class for all source adapters with common functionality
 */
export abstract class BaseSourceAdapter implements ISourceAdapter {
  config: SourceConfig;
  private requestCount: number = 0;
  private windowStart: number = Date.now();

  constructor(config: SourceConfig) {
    this.config = config;
  }

  abstract fetchEvents(sport?: string): Promise<RawSportData[]>;
  abstract healthCheck(): Promise<boolean>;

  getRateLimitInfo() {
    const elapsed = (Date.now() - this.windowStart) / 1000;
    const remaining = Math.max(
      0,
      this.config.rateLimit.requests -
        Math.floor(this.requestCount * (1 / elapsed || 1))
    );
    return {
      remaining,
      resetsAt: new Date(this.windowStart + this.config.rateLimit.perSeconds * 1000),
    };
  }

  protected async fetch(url: string, options?: RequestInit): Promise<any> {
    // Rate limiting
    const elapsed = (Date.now() - this.windowStart) / 1000;
    if (
      elapsed < this.config.rateLimit.perSeconds &&
      this.requestCount >= this.config.rateLimit.requests
    ) {
      const waitMs =
        this.config.rateLimit.perSeconds * 1000 - (Date.now() - this.windowStart);
      console.log(
        `[${this.config.name}] Rate limited, waiting ${waitMs}ms`
      );
      await new Promise((r) => setTimeout(r, waitMs));
      this.requestCount = 0;
      this.windowStart = Date.now();
    }

    this.requestCount++;

    const headers: Record<string, string> = {
      "User-Agent": "SocialBets/1.0 DataCollector",
      Accept: "application/json",
      ...(this.config.apiKey
        ? { "x-api-key": this.config.apiKey }
        : {}),
      ...(options?.headers as Record<string, string> || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(
        `[${this.config.name}] HTTP ${response.status}: ${response.statusText}`
      );
    }

    return response.json();
  }

  protected delay(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }
}
