import { notFound } from 'next/navigation';

// Geçici shim: next-intl/server yerine minimal getRequestConfig
type GetRequestConfigParams = { locale?: string };
function getRequestConfig<T>(handler: (params: GetRequestConfigParams) => T | Promise<T>): (params: GetRequestConfigParams) => T | Promise<T> {
  return handler;
}

export const locales = ['en', 'tr', 'de', 'es'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'en';

export const localeInfo = {
  en: { name: 'English', flag: '🇺🇸', nativeName: 'English' },
  tr: { name: 'Turkish', flag: '🇹🇷', nativeName: 'Türkçe' },
  de: { name: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
  es: { name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' }
};

export default getRequestConfig(async ({ locale }) => {
  const currentLocale = (locale ?? defaultLocale) as string;
  if (!locales.includes(currentLocale as Locale)) notFound();

  return {
    locale: currentLocale,
    messages: (await import(`./messages/${currentLocale}.json`)).default
  };
});
