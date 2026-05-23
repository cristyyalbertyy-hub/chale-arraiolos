import { useTranslation } from 'react-i18next'
import { supportedLanguages, type AppLanguage } from '../i18n/resources'

const labels: Record<AppLanguage, string> = {
  pt: 'PT',
  en: 'EN',
  fr: 'FR',
}

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { i18n, t } = useTranslation()
  const current = i18n.language.split('-')[0] as AppLanguage

  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      role="group"
      aria-label={t('common.language')}
    >
      {supportedLanguages.map((lang) => {
        const active = current === lang
        return (
          <button
            key={lang}
            type="button"
            onClick={() => void i18n.changeLanguage(lang)}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
              active
                ? 'bg-olive text-cream'
                : 'text-stone-muted hover:bg-sand/80 hover:text-stone'
            }`}
            aria-pressed={active}
            aria-label={labels[lang]}
          >
            {labels[lang]}
          </button>
        )
      })}
    </div>
  )
}
