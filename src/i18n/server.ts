import i18next, { type TFunction } from 'i18next'
import { isAppLanguage, resources } from './resources'

const translatorCache = new Map<string, TFunction>()

/** Traduções síncronas para API serverless (evita await no cold start). */
export function createServerTranslator(lang: string): TFunction {
  const lng = isAppLanguage(lang) ? lang : 'pt'
  const cached = translatorCache.get(lng)
  if (cached) return cached

  const instance = i18next.createInstance()
  instance.init({
    resources,
    lng,
    fallbackLng: 'pt',
    interpolation: { escapeValue: false },
  })

  const t = instance.getFixedT(lng)
  translatorCache.set(lng, t)
  return t
}
