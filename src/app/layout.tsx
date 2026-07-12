import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { RootProviders } from "@/components/layout/RootProviders";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SocialBets - Scommetti con gli Amici",
  description: "Piattaforma di scommesse social senza soldi reali. Competi con i tuoi amici!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-background antialiased")}>
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
