"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { LogOut, User, Settings } from "lucide-react";
import { useState } from "react";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg p-2 hover:bg-accent transition-colors"
      >
        {user.image ? (
          <img src={user.image} alt="" className="h-8 w-8 rounded-full" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <User className="h-4 w-4" />
          </div>
        )}
        <span className="hidden md:block text-sm font-medium">
          {user.username || user.name || "Utente"}
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-2xl">
            <div className="border-b border-border px-3 py-2 mb-1">
              <p className="text-sm font-medium">{user.name || user.username}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Link
              href="/wallet"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-accent hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
              Impostazioni
            </Link>
            <button
              onClick={() => signOut()}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-accent"
            >
              <LogOut className="h-4 w-4" />
              Esci
            </button>
          </div>
        </>
      )}
    </div>
  );
}
