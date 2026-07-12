import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { Gift, Copy, Users, Link as LinkIcon, CheckCircle } from "lucide-react";
import { InviteClient } from "./InviteClient";

export default async function InvitePage() {
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { id: session!.user!.id },
    select: { inviteCode: true },
  });

  const referralCount = await prisma.user.count({
    where: { referredBy: user?.inviteCode },
  });

  const friends = await prisma.friendship.findMany({
    where: {
      OR: [
        { initiatorId: session!.user!.id },
        { receiverId: session!.user!.id },
      ],
      status: "ACCEPTED",
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Invita Amici</h1>
        <p className="text-gray-500">Condividi il tuo codice e guadagna {formatCurrency(500)} per ogni amico</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-6">
          <div className="flex items-center gap-3 mb-3">
            <Gift className="h-5 w-5 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">Il tuo codice invito</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="rounded-lg bg-black/30 px-4 py-2 text-2xl font-bold text-white tracking-wider">
              {user?.inviteCode}
            </code>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            Condividi questo codice con i tuoi amici
          </p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
          <div className="flex items-center gap-3 mb-3">
            <LinkIcon className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">Link diretto</span>
          </div>
          <InviteClient code={user?.inviteCode || ""} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-center">
          <p className="text-3xl font-bold text-emerald-400">{friends.length}</p>
          <p className="text-sm text-gray-500">Amici totali</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-center">
          <p className="text-3xl font-bold text-blue-400">{referralCount}</p>
          <p className="text-sm text-gray-500">Referral registrati</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-center">
          <p className="text-3xl font-bold text-yellow-400">{formatCurrency(referralCount * 500)}</p>
          <p className="text-sm text-gray-500">Bonus guadagnati</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <h2 className="mb-4 font-semibold">Usa un codice invito</h2>
        <RedeemForm />
      </div>
    </div>
  );
}

async function RedeemForm() {
  return (
    <form action="/api/invite" method="POST" className="flex gap-3">
      <input type="hidden" name="action" value="redeem" />
      <input
        type="text"
        name="inviteCode"
        placeholder="Inserisci codice invito..."
        className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-lg bg-emerald-500 px-6 py-2 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors"
      >
        Usa Codice
      </button>
    </form>
  );
}
