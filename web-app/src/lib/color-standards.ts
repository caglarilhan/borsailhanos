/**
 * P2-14: Renk Tutarlılığı - Tailwind palette standartlaştırma
 * Tüm renk kullanımlarını merkezi bir yerden yönet
 */

// Standart başarı/pozitif renkler (yeşil)
export const SUCCESS_COLORS = {
  text: 'text-green-600', // #16a34a
  bg: 'bg-green-50',
  border: 'border-green-200',
  bgDark: 'bg-green-500',
  hex: '#22c55e', // Tailwind green-500
  hexDark: '#16a34a', // Tailwind green-600
  inline: 'text-green-700',
  light: 'text-green-500',
} as const;

// Standart hata/negatif renkler (kırmızı)
export const ERROR_COLORS = {
  text: 'text-red-600', // #dc2626
  bg: 'bg-red-50',
  border: 'border-red-200',
  bgDark: 'bg-red-500',
  hex: '#ef4444', // Tailwind red-500
  hexDark: '#dc2626', // Tailwind red-600
  inline: 'text-red-700',
  light: 'text-red-500',
} as const;

// Standart uyarı renkler (sarı/turuncu)
export const WARNING_COLORS = {
  text: 'text-amber-600', // #d97706
  bg: 'bg-amber-50',
  border: 'border-amber-200',
  bgDark: 'bg-amber-500',
  hex: '#f59e0b', // Tailwind amber-500
  inline: 'text-amber-700',
} as const;

// Standart bilgi renkler (mavi)
export const INFO_COLORS = {
  text: 'text-blue-600', // #2563eb
  bg: 'bg-blue-50',
  border: 'border-blue-200',
  bgDark: 'bg-blue-500',
  hex: '#3b82f6', // Tailwind blue-500
  inline: 'text-blue-700',
} as const;

/**
 * Pozitif/negatif duruma göre renk döndür
 */
export function getSignalColor(isPositive: boolean): {
  text: string;
  bg: string;
  border: string;
  hex: string;
} {
  return isPositive ? SUCCESS_COLORS : ERROR_COLORS;
}

/**
 * Yükseliş/düşüş için renk class döndür
 */
export function getTrendColorClass(trend: 'Yükseliş' | 'Düşüş' | 'Nötr'): {
  text: string;
  bg: string;
  border: string;
} {
  switch (trend) {
    case 'Yükseliş':
      return {
        text: SUCCESS_COLORS.text,
        bg: SUCCESS_COLORS.bg,
        border: SUCCESS_COLORS.border,
      };
    case 'Düşüş':
      return {
        text: ERROR_COLORS.text,
        bg: ERROR_COLORS.bg,
        border: ERROR_COLORS.border,
      };
    default:
      return {
        text: 'text-slate-600',
        bg: 'bg-slate-50',
        border: 'border-slate-200',
      };
  }
}

