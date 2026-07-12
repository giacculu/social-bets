import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"];

type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  username?: string;
  balance?: number;
  realBalance?: number;
  inviteCode?: string;
  role?: "USER" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN";
};

export async function requireAuth(): Promise<AuthUser> {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session.user as AuthUser;
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();
  if (!user.role || !ADMIN_ROLES.includes(user.role)) {
    redirect("/dashboard");
  }
  return user;
}

export async function requireAuthApi() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }
  return session.user as AuthUser;
}
