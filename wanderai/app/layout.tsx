import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/lib/client/AuthProvider";
import ChatAssistant from "@/components/chat/ChatAssistant";
import MobileBottomNav from "@/components/MobileBottomNav";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "WanderAI — Explore Beyond the Destination",
  description:
    "Your AI-powered guide to places, people, culture, food and experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col bg-paper text-ink font-sans antialiased">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <div className="h-16 md:hidden" />
          <ChatAssistant />
          <MobileBottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
