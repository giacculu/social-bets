"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ShareButton({
  title,
  url,
  text,
  className,
}: {
  title: string;
  url?: string;
  text?: string;
  className?: string;
}) {
  const handleShare = async () => {
    const shareUrl = url || window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copiato!");
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleShare} className={className}>
      <Share2 className="h-4 w-4 mr-1" /> Condividi
    </Button>
  );
}
