import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  // Desteklenen diller
  locales: locales,
  
  // Varsayılan dil
  defaultLocale: defaultLocale,
  
  // URL'de dil prefix'i göster
  localePrefix: 'always'
});

export const config = {
  // Tüm route'ları yakala, sadece static dosyaları hariç tut
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
