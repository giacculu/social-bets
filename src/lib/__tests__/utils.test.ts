import { describe, it, expect } from "vitest";
import { formatCurrency, formatOdds, formatDate, cn } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    const result = cn("text-red-500", "text-blue-500");
    expect(result).toBe("text-blue-500");
  });

  it("handles conditional classes", () => {
    const result = cn("base", false && "hidden", "extra");
    expect(result).toContain("base");
    expect(result).toContain("extra");
    expect(result).not.toContain("hidden");
  });
});

describe("formatCurrency", () => {
  it("formats EUR amounts", () => {
    const result = formatCurrency(100);
    expect(result).toContain("100");
    expect(result).toContain("€");
  });

  it("formats zero", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0");
  });
});

describe("formatOdds", () => {
  it("formats odds to 2 decimal places", () => {
    expect(formatOdds(2.5)).toBe("2.50");
    expect(formatOdds(1.75)).toBe("1.75");
    expect(formatOdds(3)).toBe("3.00");
  });
});

describe("formatDate", () => {
  it("formats a date string", () => {
    const result = formatDate("2025-01-15T10:30:00Z");
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });

  it("formats a Date object", () => {
    const result = formatDate(new Date("2025-06-01"));
    expect(result).toBeTruthy();
  });
});
