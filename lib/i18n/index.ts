/**
 * i18n configuration - v3.0
 * Supports multiple languages
 */

import { zh, Translations } from './zh';

export const translations = {
  zh
} as const;

export type Locale = keyof typeof translations;
export const defaultLocale: Locale = 'zh';

/**
 * Get translation for a specific locale
 * Currently only supports Chinese (zh)
 */
export function getTranslations(locale: Locale = defaultLocale): Translations {
  return translations[locale];
}

/**
 * Hook to use translations in client components
 * This is a placeholder - real implementation would use React Context
 */
export function useTranslations(locale: Locale = defaultLocale) {
  const t = translations[locale];
  return { t, locale };
}
