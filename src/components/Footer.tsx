import { useTranslation } from 'react-i18next'

export function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-sand bg-cream py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
        <div className="text-center sm:text-left">
          <p className="font-display text-lg font-semibold text-olive">
            {t('common.brand')}
          </p>
          <p className="mt-1 text-sm text-stone-muted">{t('footer.location')}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-sm text-stone-muted">
          <a href="mailto:reservas@chale-arraiolos.pt" className="hover:text-terracotta">
            reservas@chale-arraiolos.pt
          </a>
          <a href="tel:+351912345678" className="hover:text-terracotta">
            +351 912 345 678
          </a>
        </div>
        <p className="text-xs text-stone-muted">
          © {year} {t('common.brand')}
        </p>
      </div>
    </footer>
  )
}
