"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { locales, localeInfo, type Locale } from "@/i18n";

export default function LanguageSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLanguageChange = (newLocale: Locale) => {
    // Mevcut path'den locale'i çıkar
    const pathWithoutLocale = pathname.replace(`/${locale}`, '');
    
    // Yeni locale ile path oluştur
    const newPath = `/${newLocale}${pathWithoutLocale}`;
    
    // Yeni path'e yönlendir
    router.push(newPath);
    setIsOpen(false);
  };

  const currentLocaleInfo = localeInfo[locale as Locale];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm border rounded hover:bg-gray-50"
        aria-label={t("language")}
      >
        <span>{currentLocaleInfo?.flag}</span>
        <span className="hidden sm:inline">{currentLocaleInfo?.nativeName}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
          <div className="py-1">
            {locales.map((loc) => {
              const locInfo = localeInfo[loc];
              const isActive = loc === locale;
              
              return (
                <button
                  key={loc}
                  onClick={() => handleLanguageChange(loc)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-3 ${
                    isActive ? "bg-blue-50 text-blue-600" : ""
                  }`}
                >
                  <span className="text-lg">{locInfo.flag}</span>
                  <div className="flex flex-col">
                    <span className="font-medium">{locInfo.nativeName}</span>
                    <span className="text-xs text-gray-500">{locInfo.name}</span>
                  </div>
                  {isActive && (
                    <svg className="w-4 h-4 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
