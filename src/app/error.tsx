"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Qualcosa è andato storto</h2>
        <p className="text-muted-foreground">
          {error.message || "Si è verificato un errore imprevisto."}
        </p>
        <Button onClick={reset} className="bg-primary text-primary-foreground">
          Riprova
        </Button>
      </div>
    </div>
  );
}
