"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "ar";
type Direction = "ltr" | "rtl";

interface LanguageContextType {
  language: Language;
  direction: Direction;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Simple dictionary for demo
const dictionary: Record<string, Record<Language, string>> = {
  orbital: { en: "ORBITAL", ar: "المداري" },
  global_maritime_logistics: {
    en: "GLOBAL MARITIME LOGISTICS",
    ar: "اللوجستيات البحرية العالمية",
  },
  local_scan: { en: "LOCAL SCAN", ar: "مسح محلي" },
  global_orbit: { en: "GLOBAL ORBIT", ar: "المدار العالمي" },
  ops_zones: { en: "OPS ZONES", ar: "مناطق العمليات" },
  watchlist: { en: "WATCHLIST", ar: "قائمة المراقبة" },
  geofence_selector: { en: "GEOFENCE SELECTOR", ar: "محدد المنطقة الجغرافية" },
  global_view: { en: "GLOBAL VIEW", ar: "نظرة عالمية" },
  suez_canal: { en: "SUEZ CANAL", ar: "قناة السويس" },
  port_of_rotterdam: { en: "PORT OF ROTTERDAM", ar: "ميناء روتردام" },
  crisis_simulation: { en: "CRISIS SIMULATION", ar: "محاكاة الأزمات" },
  simulate_piracy: { en: "SIMULATE PIRACY EVENT", ar: "محاكاة القرصنة" },
  crisis_active: {
    en: "CRISIS ACTIVE - ACKNOWLEDGE?",
    ar: "أزمة نشطة - تأكيد؟",
  },
  priority_vessels: { en: "PRIORITY VESSELS", ar: "السفن ذات الأولوية" },
  initializing: {
    en: "INITIALIZING SATELLITE LINK...",
    ar: "تهيئة رابط القمر الصناعي...",
  },
  piracy_alert: { en: "PIRACY ALERT", ar: "تنبيه القرصنة" },
  vessels_danger: { en: "VESSELS IN DANGER ZONE", ar: "سفن في منطقة الخطر" },
  loading: { en: "LOADING...", ar: "جار التحميل..." },
  singapore_strait: { en: "SINGAPORE STRAIT", ar: "مضيق سنغافورة" },
  strait_of_dover: { en: "STRAIT OF DOVER", ar: "مضيق دوفر" },
  panama_canal: { en: "PANAMA CANAL", ar: "قناة بنما" },
  la_lb: { en: "LA / LONG BEACH", ar: "لوس أنجلوس / لونج بيتش" },
  strait_of_hormuz: { en: "STRAIT OF HORMUZ", ar: "مضيق هرمز" },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [direction, setDirection] = useState<Direction>("ltr");

  useEffect(() => {
    // Sync the HTML dir attribute
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }, [direction, language]);

  const toggleLanguage = () => {
    if (language === "en") {
      setLanguage("ar");
      setDirection("rtl");
    } else {
      setLanguage("en");
      setDirection("ltr");
    }
  };

  const t = (key: string) => {
    const entry = dictionary[key];
    if (!entry) return key;
    return entry[language];
  };

  return (
    <LanguageContext.Provider
      value={{ language, direction, toggleLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
