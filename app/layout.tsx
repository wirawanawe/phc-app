import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { defaultLocale } from "./i18n-config";
import { AuthProvider } from "./contexts/AuthContext";
import { WebsiteSettingsProvider } from "./contexts/WebsiteSettingsContext";
import { Toaster } from "react-hot-toast";
import MobileBottomNav from "./components/MobileBottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PHC - Platform Kesehatan Pribadi",
  description: "Platform manajemen kesehatan pribadi Anda",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang={defaultLocale}
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body
        className="min-h-screen bg-black text-gray-100"
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          <WebsiteSettingsProvider>
            {children}
            <MobileBottomNav />
            <Toaster position="top-right" />
          </WebsiteSettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
