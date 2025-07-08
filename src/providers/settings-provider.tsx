"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SettingsContextType {
  country: string;
  setCountry: (country: string) => void;
  language: string;
  setLanguage: (language: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

const COUNTRY_STORAGE_KEY = "readon-country";
const LANGUAGE_STORAGE_KEY = "readon-language";

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [country, setCountry] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(COUNTRY_STORAGE_KEY) || "us";
    }
    return "us";
  });

  const [language, setLanguage] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(LANGUAGE_STORAGE_KEY) || "en";
    }
    return "en";
  });

  useEffect(() => {
    try {
      localStorage.setItem(COUNTRY_STORAGE_KEY, country);
    } catch (error) {
      console.error("Failed to save country to localStorage", error);
    }
  }, [country]);

  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
      console.error("Failed to save language to localStorage", error);
    }
  }, [language]);

  const value = { country, setCountry, language, setLanguage };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
