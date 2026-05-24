import i18next, { type TFunction } from 'i18next'
import pt from '../locales/pt.json'
import en from '../locales/en.json'
import fr from '../locales/fr.json'

const supported = ['pt', 'en', 'fr'] as const
export type AppLanguage = (typeof supported)[number]

export function isAppLanguage(value: string): value is AppLanguage {
  return (supported as readonly string[]).includes(value)
}

const translatorCache = new Map<string, TFunction>()

export function createServerTranslator(lang: string): TFunction {
  const lng = isAppLanguage(lang) ? lang : 'pt'
  const cached = translatorCache.get(lng)
  if (cached) return cached

  const instance = i18next.createInstance()
  instance.init({
    resources: {
      pt: { translation: pt },
      en: { translation: en },
      fr: { translation: fr },
    },
    lng,
    fallbackLng: 'pt',
    interpolation: { escapeValue: false },
  })

  const t = instance.getFixedT(lng)
  translatorCache.set(lng, t)
  return t
}
