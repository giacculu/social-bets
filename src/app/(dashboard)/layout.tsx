import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SportsSidebar } from "@/components/layout/SportsSidebar";
import { UserMenu } from "@/components/layout/UserMenu";
import { WalletBadge } from "@/components/layout/WalletBadge";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const sports = await prisma.sport.findMany({
    where: { active: true },
    include: { leagues: { where: { active: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 font-bold text-black">
              SB
            </div>
            <span className="text-lg font-bold">SocialBets</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link href="/sports" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
              Sport
            </Link>
            <Link href="/bets" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
              Le Mie Scommesse
            </Link>
            <Link href="/custom-bets" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
              Sfide
            </Link>
            <Link href="/friends" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
              Amici
            </Link>
            <Link href="/leaderboard" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
              Classifica
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <WalletBadge balance={session.user.balance ?? 0} />
            <UserMenu user={session.user} />
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden lg:block w-64 border-r border-gray-800 p-4">
          <SportsSidebar sports={sports} />
        </aside>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
