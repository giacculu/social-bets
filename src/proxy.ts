import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  if (isAdminRoute) {
    const role = (req.auth?.user as any)?.role as string | undefined;
    if (!role || !ADMIN_ROLES.includes(role)) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Forbidden: admin access required" },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
