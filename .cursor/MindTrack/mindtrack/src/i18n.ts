import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Supported languages - prioritizing American English and Spanish
export const locales = ['en', 'es', 'tr', 'de'] as const;
export type Locale = typeof locales[number];

// Default language - American English
export const defaultLocale: Locale = 'en';

// Language information
export const localeInfo = {
  en: { name: 'English (US)', flag: '🇺🇸', nativeName: 'English' },
  es: { name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
  tr: { name: 'Turkish', flag: '🇹🇷', nativeName: 'Türkçe' },
  de: { name: 'German', flag: '🇩🇪', nativeName: 'Deutsch' }
};

export default getRequestConfig(async ({ locale }) => {
  // 404 for unsupported language
  if (!locales.includes(locale as Locale)) notFound();

  return {
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
