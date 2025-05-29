import type { Metadata, Viewport } from "next";
import { GeistSans, GeistMono } from "geist/font";
import "./globals.css";
import { defaultLocale } from "./i18n-config";
import { AuthProvider } from "./contexts/AuthContext";
import { WebsiteSettingsProvider } from "./contexts/WebsiteSettingsContext";
import { Toaster } from "react-hot-toast";
import MobileBottomNav from "./components/MobileBottomNav";

export const metadata: Metadata = {
  title: "PHC - Platform Kesehatan Pribadi",
  description: "Platform manajemen kesehatan pribadi Anda",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#E32345",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang={defaultLocale}
      className={`${GeistSans.variable} ${GeistMono.variable} dark`}
    >
      <body
        className={`min-h-screen bg-background text-foreground antialiased ${GeistSans.className}`}
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          <WebsiteSettingsProvider>
            <div className="relative min-h-screen">
              {children}
              <MobileBottomNav />
            </div>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#1f2937",
                  color: "#f9fafb",
                  border: "1px solid #374151",
                },
                success: {
                  iconTheme: {
                    primary: "#10b981",
                    secondary: "#f9fafb",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "#ef4444",
                    secondary: "#f9fafb",
                  },
                },
              }}
            />
          </WebsiteSettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
