import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pool Mind",
  description: "Controle químico e manutenção da sua piscina",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#03045e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geist.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-dvh">
        {children}
      </body>
    </html>
  );
}
