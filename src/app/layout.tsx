import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/languageContext";
import { ThemeProvider } from "@/lib/themeContext";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { PwaRegister } from "@/components/PwaRegister";
import { AudioPlayerBar } from "@/components/AudioPlayerBar";

export const metadata: Metadata = {
  title: "KisanSaathi - Smart Farming & Agricultural Intelligence",
  description: "A production-quality, mobile-first Progressive Web App for Indian farmers.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KisanSaathi",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1B4332",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mr" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-screen bg-[#F5F2EB] dark:bg-[#0D110E] text-zinc-900 dark:text-zinc-100 antialiased selection:bg-forest-100 selection:text-forest-900">
        <ThemeProvider>
          <LanguageProvider>
            <PwaRegister />
            <div className="flex flex-col min-h-screen max-w-md mx-auto bg-[#FAF8F4] dark:bg-[#131814] shadow-2xl relative border-x border-cream-200/70 dark:border-forest-900/40">
              <Header />
              <main className="flex-1 pb-24 px-3.5 py-4 overflow-y-auto">
                {children}
              </main>
              <AudioPlayerBar />
              <BottomNav />
            </div>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
