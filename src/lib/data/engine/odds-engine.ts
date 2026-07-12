import { OddsCalculation, ValueBet, IOddsEngine } from "../types";

export class OddsEngine implements IOddsEngine {
  private static instance: OddsEngine;
  private readonly MARGIN_TARGET = 0.05; // 5% house edge (lower than real bookmakers)
  private readonly MIN_ODDS = 1.01;
  private readonly MAX_ODDS = 50.0;
  private readonly KELLY_FRACTION = 0.25; // quarter Kelly for safety

  static getInstance(): OddsEngine {
    if (!OddsEngine.instance) {
      OddsEngine.instance = new OddsEngine();
    }
    return OddsEngine.instance;
  }

  /**
   * Calculate fair odds from raw bookmaker odds by removing the margin
   */
  calculateFairOdds(outcomes: { name: string; odds: number }[]): OddsCalculation[] {
    if (outcomes.length === 0) return [];

    const margin = this.calculateBookmakerMargin(outcomes);
    const totalImplied = outcomes.reduce(
      (sum, o) => sum + this.impliedProbability(o.odds),
      0
    );

    return outcomes.map((outcome) => {
      const impliedProb = this.impliedProbability(outcome.odds);
      const fairProb = impliedProb / totalImplied;
      const fairOdds = this.probabilityToOdds(fairProb);
      const adjustedOdds = this.adjustForMargin(fairOdds, this.MARGIN_TARGET);

      // Value detection: if our fair odds are higher than the raw odds, there's value
      const value = outcome.odds - adjustedOdds;
      const kellyStake = this.calculateKelly(fairProb, outcome.odds);

      return {
        impliedProbability: fairProb,
        bookmakerMargin: margin,
        fairOdds: this.roundOdds(fairOdds),
        adjustedOdds: this.roundOdds(adjustedOdds),
        kellyStake: this.roundOdds(kellyStake),
        value: this.roundOdds(value),
      };
    });
  }

  /**
   * Calculate total bookmaker margin (overround)
   */
  calculateBookmakerMargin(outcomes: { odds: number }[]): number {
    if (outcomes.length === 0) return 0;
    const totalImplied = outcomes.reduce(
      (sum, o) => sum + this.impliedProbability(o.odds),
      0
    );
    return Math.max(0, totalImplied - 1);
  }

  /**
   * Adjust odds for a target margin
   */
  adjustForMargin(odds: number, targetMargin: number): number {
    const fairProb = this.impliedProbability(odds);
    const adjustedProb = fairProb * (1 + targetMargin);
    return this.roundOdds(this.probabilityToOdds(Math.min(adjustedProb, 0.99)));
  }

  /**
   * Detect value bets by comparing our probabilities against market odds
   */
  detectValueBets(
    marketOdds: number[],
    ourProbabilities: number[],
    outcomeNames: string[]
  ): ValueBet[] {
    const valueBets: ValueBet[] = [];

    for (let i = 0; i < marketOdds.length; i++) {
      const marketProb = this.impliedProbability(marketOdds[i]);
      const trueProb = ourProbabilities[i] || marketProb;
      const edge = trueProb - marketProb;

      if (edge > 0.02) {
        // At least 2% edge
        const fairOdds = this.probabilityToOdds(trueProb);
        const kelly = this.calculateKelly(trueProb, marketOdds[i]);

        valueBets.push({
          outcomeName: outcomeNames[i] || `Outcome ${i}`,
          bookmakerOdds: marketOdds[i],
          fairOdds: this.roundOdds(fairOdds),
          impliedProbability: marketProb,
          trueProbability: trueProb,
          edge: this.roundOdds(edge),
          kellyFraction: this.roundOdds(kelly),
        });
      }
    }

    return valueBets.sort((a, b) => b.edge - a.edge);
  }

  /**
   * Blend odds from multiple sources using weighted average
   */
  blendOdds(sources: { odds: number; weight: number }[]): number {
    if (sources.length === 0) return 0;
    if (sources.length === 1) return sources[0].odds;

    const totalWeight = sources.reduce((sum, s) => sum + s.weight, 0);
    if (totalWeight === 0) return sources[0].odds;

    // Convert to probabilities, blend, convert back
    const blendedProb =
      sources.reduce((sum, s) => {
        const prob = this.impliedProbability(s.odds);
        return sum + (prob * s.weight) / totalWeight;
      }, 0);

    return this.roundOdds(this.probabilityToOdds(blendedProb));
  }

  /**
   * Calculate odds for a new market based on team/player ratings
   */
  calculateOddsFromRatings(
    homeRating: number,
    awayRating: number,
    drawProbability: number = 0
  ): { home: number; draw: number; away: number } {
    const totalRating = homeRating + awayRating;

    let homeProb: number;
    let awayProb: number;

    if (drawProbability > 0) {
      homeProb = (1 - drawProbability) * (homeRating / totalRating);
      awayProb = (1 - drawProbability) * (awayRating / totalRating);
    } else {
      homeProb = homeRating / totalRating;
      awayProb = awayRating / totalRating;
    }

    // Apply margin
    const margin = this.MARGIN_TARGET;
    homeProb *= 1 - margin;
    awayProb *= 1 - margin;
    const drawProb = drawProbability > 0 ? drawProbability * (1 - margin) : 0;

    return {
      home: this.roundOdds(this.probabilityToOdds(homeProb)),
      draw: drawProb > 0 ? this.roundOdds(this.probabilityToOdds(drawProb)) : 0,
      away: this.roundOdds(this.probabilityToOdds(awayProb)),
    };
  }

  /**
   * Generate Over/Under odds from expected total goals/points
   */
  calculateOverUnderOdds(
    expectedTotal: number,
    line: number = 2.5,
    variance: number = 1.2
  ): { over: number; under: number } {
    // Poisson-based approximation
    const overProb = this.poissonOverProbability(expectedTotal, line, variance);
    const underProb = 1 - overProb;

    const margin = this.MARGIN_TARGET;
    return {
      over: this.roundOdds(this.probabilityToOdds(overProb * (1 - margin))),
      under: this.roundOdds(this.probabilityToOdds(underProb * (1 - margin))),
    };
  }

  /**
   * Generate BTTS (Both Teams To Score) odds
   */
  calculateBTTSOdds(
    homeExpectedGoals: number,
    awayExpectedGoals: number
  ): { yes: number; no: number } {
    const pHomeScores = 1 - Math.exp(-homeExpectedGoals);
    const pAwayScores = 1 - Math.exp(-awayExpectedGoals);

    const pBothScore = pHomeScores * pAwayScores;
    const pNotBothScore = 1 - pBothScore;

    const margin = this.MARGIN_TARGET;
    return {
      yes: this.roundOdds(this.probabilityToOdds(pBothScore * (1 - margin))),
      no: this.roundOdds(this.probabilityToOdds(pNotBothScore * (1 - margin))),
    };
  }

  /**
   * Calculate correct score odds (simplified)
   */
  calculateCorrectScoreOdds(
    homeExpectedGoals: number,
    awayExpectedGoals: number,
    maxGoals: number = 5
  ): { score: string; odds: number }[] {
    const scores: { score: string; odds: number }[] = [];
    const margin = this.MARGIN_TARGET;

    for (let h = 0; h <= maxGoals; h++) {
      for (let a = 0; a <= maxGoals; a++) {
        const prob =
          this.poissonPMF(h, homeExpectedGoals) *
          this.poissonPMF(a, awayExpectedGoals) *
          (1 - margin);

        if (prob > 0.005) {
          scores.push({
            score: `${h}-${a}`,
            odds: this.roundOdds(this.probabilityToOdds(prob)),
          });
        }
      }
    }

    return scores.sort((a, b) => a.odds - b.odds);
  }

  // ─── Private Helpers ────────────────────────────────────

  private impliedProbability(odds: number): number {
    return 1 / Math.max(odds, this.MIN_ODDS);
  }

  private probabilityToOdds(prob: number): number {
    return 1 / Math.max(Math.min(prob, 0.9999), 0.0001);
  }

  private calculateKelly(trueProb: number, odds: number): number {
    const q = 1 - trueProb;
    const b = odds - 1;
    if (b <= 0) return 0;
    const kelly = (trueProb * b - q) / b;
    return Math.max(0, kelly * this.KELLY_FRACTION);
  }

  private poissonPMF(k: number, lambda: number): number {
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / this.factorial(k);
  }

  private poissonOverProbability(
    expected: number,
    line: number,
    variance: number = 1.2
  ): number {
    // Use normal approximation for Poisson
    const adjustedLambda = expected * variance;
    const lineInt = Math.ceil(line);

    let probOver = 0;
    for (let k = lineInt; k <= 15; k++) {
      probOver += this.poissonPMF(k, adjustedLambda);
    }
    return Math.min(probOver, 0.95);
  }

  private factorial(n: number): number {
    if (n <= 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  }

  private roundOdds(odds: number): number {
    if (odds < this.MIN_ODDS) return this.MIN_ODDS;
    if (odds > this.MAX_ODDS) return this.MAX_ODDS;

    // Round to 2 decimal places with smart rounding
    if (odds < 2) return Math.round(odds * 100) / 100;
    if (odds < 5) return Math.round(odds * 50) / 50;
    return Math.round(odds * 20) / 20;
  }
}
