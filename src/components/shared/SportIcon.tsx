const sportIcons: Record<string, string> = {
  calcio: "⚽",
  basket: "🏀",
  tennis: "🎾",
  f1: "🏎️",
  mma: "🥊",
  baseball: "⚾",
  hockey: "🏒",
  football: "🏈",
};

export function SportIcon({ slug, className }: { slug: string; className?: string }) {
  return (
    <span className={className} role="img" aria-label={slug}>
      {sportIcons[slug] || "🏆"}
    </span>
  );
}
