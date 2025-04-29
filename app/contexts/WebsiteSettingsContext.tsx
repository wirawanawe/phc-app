"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface WebsiteSettings {
  id: string;
  logoUrl: string;
  heroBackgroundUrl: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  workingHours: string;
  mapLocation?: string;
  facebook: string;
  twitter: string;
  instagram: string;
  youtube: string;
}

interface WebsiteSettingsContextType {
  settings: WebsiteSettings | null;
  loading: boolean;
}

const WebsiteSettingsContext = createContext<
  WebsiteSettingsContextType | undefined
>(undefined);

export function WebsiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings");
        if (response.ok) {
          const { data } = await response.json();
          setSettings(data);
        } else {
          console.error("Failed to load website settings");
        }
      } catch (error) {
        console.error("Error fetching website settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return (
    <WebsiteSettingsContext.Provider value={{ settings, loading }}>
      {children}
    </WebsiteSettingsContext.Provider>
  );
}

export function useWebsiteSettings() {
  const context = useContext(WebsiteSettingsContext);
  if (context === undefined) {
    throw new Error(
      "useWebsiteSettings must be used within a WebsiteSettingsProvider"
    );
  }
  return context;
}
