import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "YisusNotes",
  description: "Notas rápidas y compartidas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={outfit.className}>
        <div className="editor-glow" />
        <main className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center">
          {children}
        </main>
      </body>
    </html>
  );
}
