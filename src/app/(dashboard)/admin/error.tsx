"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="text-center space-y-4">
        <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="text-xl font-bold">Errore Admin</h2>
        <p className="text-muted-foreground max-w-md">
          {error.message || "Si è verificato un errore nel pannello admin."}
        </p>
        <Button onClick={reset} variant="outline">
          Riprova
        </Button>
      </div>
    </div>
  );
}
