"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, UserPlus, Check, X, Copy, Link as LinkIcon, Search } from "lucide-react";

type Friend = { id: string; username: string; name: string | null; balance: number };
type Friendship = {
  id: string;
  status: string;
  initiatorId: string;
  receiverId: string;
  initiator: Friend;
  receiver: Friend;
};

export default function FriendsPage() {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingReceived, setPendingReceived] = useState<Friendship[]>([]);
  const [inviteCode, setInviteCode] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [searchUsername, setSearchUsername] = useState("");
  const [searchError, setSearchError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [friendsRes, inviteRes] = await Promise.all([
        fetch("/api/friends/list"),
        fetch("/api/invite"),
      ]);
      const friendsData = await friendsRes.json();
      const inviteData = await inviteRes.json();

      setFriends(friendsData.friends || []);
      setPendingReceived(friendsData.pendingReceived || []);
      setInviteCode(inviteData.inviteCode || "");
      setInviteLink(`${window.location.origin}/register?ref=${inviteData.inviteCode || ""}`);
    } catch {}
    setLoading(false);
  }

  async function addFriend() {
    if (!searchUsername.trim()) return;
    setSearchError("");

    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", username: searchUsername.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSearchError(data.error);
        return;
      }
      setSearchUsername("");
      loadData();
    } catch {
      setSearchError("Errore");
    }
  }

  async function respondFriendship(friendshipId: string, action: "accept" | "decline") {
    try {
      await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, friendshipId }),
      });
      loadData();
    } catch {}
  }

  function copyLink() {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Amici</h1>
          <p className="text-gray-500">{friends.length} amici</p>
        </div>
      </div>

      {/* Invite friends */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
        <div className="flex items-center gap-3 mb-3">
          <LinkIcon className="h-5 w-5 text-emerald-400" />
          <span className="text-sm font-medium text-emerald-400">Invita amici</span>
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded-lg bg-black/30 px-3 py-2 text-sm text-white">
            {inviteLink}
          </code>
          <button
            onClick={copyLink}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors"
          >
            {copied ? "Copiato!" : "Copia"}
          </button>
        </div>
      </div>

      {/* Search/add friend */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-400">Aggiungi amico</h2>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchUsername}
              onChange={(e) => { setSearchUsername(e.target.value); setSearchError(""); }}
              onKeyDown={(e) => e.key === "Enter" && addFriend()}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
              placeholder="Cerca per username..."
            />
          </div>
          <button
            onClick={addFriend}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Aggiungi
          </button>
        </div>
        {searchError && (
          <p className="mt-2 text-sm text-red-400">{searchError}</p>
        )}
      </div>

      {/* Pending requests */}
      {pendingReceived.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-400">
            Richieste in arrivo ({pendingReceived.length})
          </h2>
          <div className="space-y-2">
            {pendingReceived.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-400 font-semibold">
                  {f.initiator.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium">@{f.initiator.username}</p>
                  <p className="text-xs text-gray-500">Vuole essere tuo amico</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => respondFriendship(f.id, "accept")}
                    className="rounded-lg bg-emerald-500 p-2 text-black hover:bg-emerald-400 transition-colors"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => respondFriendship(f.id, "decline")}
                    className="rounded-lg bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends list */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-400">
          I tuoi amici
        </h2>
        {friends.length === 0 ? (
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-600" />
            <p className="mt-4 text-gray-500">Nessun amico ancora</p>
            <p className="text-sm text-gray-600">
              Cerca per username o condividi il tuo codice invito
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900/50 p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">
                  {friend.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium">@{friend.username}</p>
                  <p className="text-xs text-gray-500">{friend.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
