import { notFound } from 'next/navigation';

// Temporary shim: minimal getRequestConfig instead of next-intl/server
type GetRequestConfigParams = { locale?: string };
function getRequestConfig<T>(handler: (params: GetRequestConfigParams) => T | Promise<T>): (params: GetRequestConfigParams) => T | Promise<T> {
  return handler;
}

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
  const currentLocale = (locale ?? defaultLocale);
  if (!locales.includes(currentLocale as Locale)) notFound();

  return {
    locale: currentLocale,
    messages: (await import(`./messages/${currentLocale}.json`)).default
  };
});
