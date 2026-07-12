import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="text-center space-y-6">
        <div className="text-6xl font-bold text-primary">404</div>
        <h1 className="text-2xl font-bold">Pagina non trovata</h1>
        <p className="text-muted-foreground max-w-md">
          La pagina che stai cercando non esiste o è stata spostata.
        </p>
        <Link href="/">
          <Button>Torna alla Home</Button>
        </Link>
      </div>
    </div>
  );
}
