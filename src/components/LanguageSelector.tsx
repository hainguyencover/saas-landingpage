"use client";

import { useTranslation } from "../lib/i18n-context";
import { Languages } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function LanguageSelector() {
    const { language, changeLanguage } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const languages = [
        { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
        { code: "en", name: "English", flag: "🇺🇸" },
        { code: "es", name: "Español", flag: "🇪🇸" },
    ];

    const currentLang = languages.find((l) => l.code === language) || languages[2];

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700"
            >
                <Languages className="w-4 h-4" />
                <span>{currentLang.flag} {currentLang.name}</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    changeLanguage(lang.code);
                                    setIsOpen(false);
                                }}
                                className={`${language === lang.code ? "bg-slate-100 text-blue-600" : "text-slate-700"
                                    } flex items-center w-full px-4 py-2 text-sm hover:bg-slate-50 transition-colors`}
                                role="menuitem"
                            >
                                <span className="mr-2">{lang.flag}</span>
                                {lang.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
