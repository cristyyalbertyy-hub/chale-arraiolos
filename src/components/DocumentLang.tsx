import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export function DocumentLang() {
  const { i18n } = useTranslation()

  useEffect(() => {
    const lang = i18n.language.split('-')[0]
    document.documentElement.lang = lang === 'en' ? 'en' : lang === 'fr' ? 'fr' : 'pt'
  }, [i18n.language])

  return null
}
