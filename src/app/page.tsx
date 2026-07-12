import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Trophy, Swords, Users, TrendingUp, Zap } from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/sports");
  }

  const stats = await prisma.$transaction([
    prisma.user.count(),
    prisma.bet.count(),
    prisma.event.count({ where: { status: "UPCOMING" } }),
  ]);

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-gray-800">
        <div className="flex h-16 items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 font-bold text-black">
              SB
            </div>
            <span className="text-lg font-bold">SocialBets</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Accedi
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors"
            >
              Registrati
            </Link>
          </div>
        </div>
      </header>

      <section className="px-4 py-24 text-center lg:px-8">
        <h1 className="text-5xl font-bold tracking-tight lg:text-7xl">
          Scommetti con gli
          <br />
          <span className="text-emerald-400">amici</span>, senza rischi
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
          Competi, sfida, vinci. Scommesse sportive e sfide personalizzate
          tutto con denaro virtuale. Nessun rischio, tutto divertimento.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/register"
            className="rounded-xl bg-emerald-500 px-8 py-3 text-base font-semibold text-black hover:bg-emerald-400 transition-colors"
          >
            Inizia Ora - 10.000€ Gratis
          </Link>
        </div>

        <div className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-6 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="h-6 w-6" />
            </div>
            <p className="text-2xl font-bold">{stats[0].toLocaleString()}</p>
            <p className="text-sm text-gray-500">Utenti Attivi</p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <Trophy className="h-6 w-6" />
            </div>
            <p className="text-2xl font-bold">{stats[1].toLocaleString()}</p>
            <p className="text-sm text-gray-500">Scommesse Fatte</p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
              <Zap className="h-6 w-6" />
            </div>
            <p className="text-2xl font-bold">{stats[2]}</p>
            <p className="text-sm text-gray-500">Eventi in Programma</p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
              <Swords className="h-6 w-6" />
            </div>
            <p className="text-2xl font-bold">∞</p>
            <p className="text-sm text-gray-500">Sfide Possibili</p>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-800 px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">Come Funziona</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-2xl font-bold text-black">
                1
              </div>
              <h3 className="text-lg font-semibold">Registrati</h3>
              <p className="mt-2 text-gray-400">
                Crea il tuo account in 30 secondi e ricevi 10.000€ virtuali gratis
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-2xl font-bold text-black">
                2
              </div>
              <h3 className="text-lg font-semibold">Scommetti o Sfida</h3>
              <p className="mt-2 text-gray-400">
                Puntata su eventi sportivi reali o crea sfide personalizzate con gli amici
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-2xl font-bold text-black">
                3
              </div>
              <h3 className="text-lg font-semibold"> Vinci la Classifica</h3>
              <p className="mt-2 text-gray-400">
                Accumula profitti virtuali e scala la classifica per diventare il miglior scommettitore
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-800 px-4 py-8 text-center text-sm text-gray-500">
        <p>SocialBets - Scommesse virtuali, niente soldi reali. Gioca responsabilmente.</p>
      </footer>
    </div>
  );
}
