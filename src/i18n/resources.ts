import pt from './locales/pt.json'
import en from './locales/en.json'
import fr from './locales/fr.json'

export const supportedLanguages = ['pt', 'en', 'fr'] as const
export type AppLanguage = (typeof supportedLanguages)[number]

export function isAppLanguage(value: string): value is AppLanguage {
  return (supportedLanguages as readonly string[]).includes(value)
}

export const resources = {
  pt: { translation: pt },
  en: { translation: en },
  fr: { translation: fr },
} as const
