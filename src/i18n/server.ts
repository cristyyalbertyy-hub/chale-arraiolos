import i18next, { type TFunction } from 'i18next'
import { isAppLanguage, resources } from './resources'

const translatorCache = new Map<string, Promise<TFunction>>()

export function createServerTranslator(lang: string): Promise<TFunction> {
  const lng = isAppLanguage(lang) ? lang : 'pt'
  const cached = translatorCache.get(lng)
  if (cached) return cached

  const instance = i18next.createInstance()
  const promise = instance
    .init({
      resources,
      lng,
      fallbackLng: 'pt',
      interpolation: { escapeValue: false },
    })
    .then(() => instance.getFixedT(lng))

  translatorCache.set(lng, promise)
  return promise
}
