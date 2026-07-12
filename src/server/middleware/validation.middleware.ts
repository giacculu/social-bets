import { type ZodSchema } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { ValidationError } from "@/lib/errors";

export function validateBody<T>(schema: ZodSchema<T>) {
  return async (req: NextRequest): Promise<T> => {
    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      const fields: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join(".");
        if (!fields[path]) fields[path] = [];
        fields[path].push(issue.message);
      }
      throw new ValidationError(fields);
    }
    return result.data;
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: NextRequest): T => {
    const params = Object.fromEntries(req.nextUrl.searchParams);
    const result = schema.safeParse(params);
    if (!result.success) {
      const fields: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join(".");
        if (!fields[path]) fields[path] = [];
        fields[path].push(issue.message);
      }
      throw new ValidationError(fields);
    }
    return result.data;
  };
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return (params: Record<string, string>): T => {
    const result = schema.safeParse(params);
    if (!result.success) {
      const fields: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join(".");
        if (!fields[path]) fields[path] = [];
        fields[path].push(issue.message);
      }
      throw new ValidationError(fields);
    }
    return result.data;
  };
}
