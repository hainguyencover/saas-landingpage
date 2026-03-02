"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import en from "../locales/en.json";
import vi from "../locales/vi.json";
import es from "../locales/es.json";

type Translations = typeof en;

interface I18nContextType {
    language: string;
    t: (key: string, replacements?: Record<string, string | number>) => string;
    changeLanguage: (lng: string) => void;
}

const translations: Record<string, any> = { en, vi, es };

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState("es"); // Default to Spanish as requested

    useEffect(() => {
        const savedLanguage = localStorage.getItem("language");
        if (savedLanguage && translations[savedLanguage]) {
            setLanguage(savedLanguage);
        } else {
            // Default to Spanish as requested by user
            setLanguage("es");
        }
    }, []);

    const changeLanguage = (lng: string) => {
        if (translations[lng]) {
            setLanguage(lng);
            localStorage.setItem("language", lng);
            document.documentElement.lang = lng;
        }
    };

    const t = (key: string, replacements?: Record<string, string | number>): string => {
        const keys = key.split(".");
        let value: any = translations[language];

        for (const k of keys) {
            value = value?.[k];
            if (value === undefined) break;
        }

        if (typeof value !== "string") {
            return key;
        }

        if (replacements) {
            let replacedValue = value;
            Object.entries(replacements).forEach(([k, v]) => {
                replacedValue = replacedValue.replace(`{{${k}}}`, String(v));
            });
            return replacedValue;
        }

        return value;
    };

    return (
        <I18nContext.Provider value={{ language, t, changeLanguage }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(I18nContext);
    if (context === undefined) {
        throw new Error("useTranslation must be used within an I18nProvider");
    }
    return context;
}
