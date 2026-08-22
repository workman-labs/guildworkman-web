import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/theme";
import { NotificationProvider } from "@/components/notifications/useNotifications";
import NotificationToast from "@/components/notifications/NotificationToast";
import { NetworkGuard } from "@/components/wallet";
import { themeScript } from "@/lib/theme";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GuildWorkman — Book trusted local pros",
  description:
    "Book vetted electricians, plumbers, carpenters and stylists near you — with payment held in on-chain escrow until the job is done.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} h-full antialiased`}>
      <head>
        {/*
         * No-FOUC theme script: paints <html data-theme> + color-scheme
         * before React hydrates. dangerouslySetInnerHTML is React's
         * sanctioned way to emit an inline script; `themeScript` is an
         * immutable, minified const whose only interpolations are
         * compile-time constants (never user input), so there's no XSS
         * surface here.
         */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-sand text-ink">
        <ThemeProvider>
          <NotificationProvider>
            <Navbar />
            <NetworkGuard />
            <main className="flex-1">{children}</main>
            <Footer />
            <NotificationToast />
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
