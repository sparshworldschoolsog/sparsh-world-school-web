import type { Metadata } from "next";
import { Geist, Geist_Mono, Cinzel } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import SiteShell from "@/components/SiteShell";
import ChatBot from "@/components/ChatBot";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: "Sparsh World School",
  description:
    "Sparsh World School — a premium learning experience grounded in tradition and built for tomorrow.",
  verification: {
    google: "l9IwsYLaVgVi8gjSHLkpGirpYRmjgLZgElkcSmDZmdQ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col text-white">
        <SiteShell />
        <Header />
        <main className="relative flex-1">{children}</main>
        <ChatBot />
      </body>
    </html>
  );
}
