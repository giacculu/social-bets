import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/server/services/auth.service";
import { registerSchema } from "@/server/validators/auth.validator";
import { handleApiError } from "@/server/middleware/error.middleware";

const authService = new AuthService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);
    const result = await authService.register(data);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
