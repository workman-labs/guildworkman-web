import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { NotificationProvider } from "@/components/notifications/useNotifications";
import NotificationToast from "@/components/notifications/NotificationToast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Runs before paint so the correct theme is applied with no flash: honour a
// stored preference, otherwise fall back to the OS setting (handled in CSS).
const themeScript = `(function(){try{var t=localStorage.getItem('theme');var r=document.documentElement;if(t==='light'||t==='dark'){r.setAttribute('data-theme',t);r.style.colorScheme=t;}else{r.style.colorScheme=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}}catch(e){}})();`;

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
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-sand text-ink">
        <NotificationProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <NotificationToast />
        </NotificationProvider>
      </body>
    </html>
  );
}
