import { describe, it, expect } from "vitest";
import {
  idParamSchema,
  paginationSchema,
  amountSchema,
  stakeSchema,
} from "@/server/validators/common.validator";

describe("common validators", () => {
  describe("idParamSchema", () => {
    it("accepts valid cuid", () => {
      const result = idParamSchema.safeParse({ id: "clx1234567890abcdef" });
      expect(result.success).toBe(true);
    });

    it("rejects empty id", () => {
      const result = idParamSchema.safeParse({ id: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("paginationSchema", () => {
    it("defaults to page 1, limit 20", () => {
      const result = paginationSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it("accepts custom pagination", () => {
      const result = paginationSchema.safeParse({ page: 3, limit: 50 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(3);
        expect(result.data.limit).toBe(50);
      }
    });

    it("rejects limit above 100", () => {
      const result = paginationSchema.safeParse({ limit: 200 });
      expect(result.success).toBe(false);
    });
  });

  describe("amountSchema", () => {
    it("accepts positive amounts", () => {
      const result = amountSchema.safeParse({ amount: 100 });
      expect(result.success).toBe(true);
    });

    it("rejects negative amounts", () => {
      const result = amountSchema.safeParse({ amount: -10 });
      expect(result.success).toBe(false);
    });

    it("rejects zero", () => {
      const result = amountSchema.safeParse({ amount: 0 });
      expect(result.success).toBe(false);
    });
  });

  describe("stakeSchema", () => {
    it("accepts valid stake", () => {
      const result = stakeSchema.safeParse({ stake: 50 });
      expect(result.success).toBe(true);
    });

    it("rejects zero stake", () => {
      const result = stakeSchema.safeParse({ stake: 0 });
      expect(result.success).toBe(false);
    });

    it("rejects negative stake", () => {
      const result = stakeSchema.safeParse({ stake: -5 });
      expect(result.success).toBe(false);
    });
  });
});
