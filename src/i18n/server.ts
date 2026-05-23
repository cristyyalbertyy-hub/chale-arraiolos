import i18next, { type TFunction } from 'i18next'
import { isAppLanguage, resources } from './resources'

export function createServerTranslator(lang: string): TFunction {
  const lng = isAppLanguage(lang) ? lang : 'pt'
  const instance = i18next.createInstance()
  void instance.init({
    resources,
    lng,
    fallbackLng: 'pt',
    interpolation: { escapeValue: false },
  })
  return instance.getFixedT(lng)
}
