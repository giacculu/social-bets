import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SportsSidebar } from "@/components/layout/SportsSidebar";
import { UserMenu } from "@/components/layout/UserMenu";
import { WalletBadge } from "@/components/layout/WalletBadge";
import { DesktopNavigation } from "@/components/layout/DesktopNavigation";
import { MobileNavigation } from "@/components/layout/MobileNavigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const wallet = await prisma.wallet.findUnique({
    where: { userId: session.user.id },
    select: { balance: true },
  });

  const sports = await prisma.sport.findMany({
    where: { active: true },
    include: { leagues: { where: { active: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
              SB
            </div>
            <span className="text-lg font-bold">SocialBets</span>
          </Link>

          <DesktopNavigation />

          <div className="flex items-center gap-3">
            <WalletBadge balance={session.user.balance ?? 0} realBalance={Number(wallet?.balance ?? 0)} />
            <UserMenu user={session.user} />
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden lg:block w-64 border-r border-border p-4">
          <SportsSidebar sports={sports} />
        </aside>

        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">{children}</main>
      </div>

      <MobileNavigation />
    </div>
  );
}
