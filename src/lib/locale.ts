import { enGB, fr, pt } from 'date-fns/locale'
import type { Locale } from 'date-fns'
import type { AppLanguage } from '../i18n/resources'

const intlLocales: Record<AppLanguage, string> = {
  pt: 'pt-PT',
  en: 'en-GB',
  fr: 'fr-FR',
}

const dateFnsLocales: Record<AppLanguage, Locale> = {
  pt,
  en: enGB,
  fr,
}

export function getIntlLocale(lang: string): string {
  if (lang === 'en' || lang === 'fr') return intlLocales[lang]
  return intlLocales.pt
}

export function getDateFnsLocale(lang: string): Locale {
  if (lang === 'en' || lang === 'fr') return dateFnsLocales[lang]
  return dateFnsLocales.pt
}
