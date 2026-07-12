import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session.user as { id: string; email: string; name?: string | null; username?: string; balance?: number };
}

export async function requireAuthApi() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }
  return session.user as { id: string; email: string; name?: string | null; username?: string; balance?: number };
}
