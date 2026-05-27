import { useTranslation } from 'react-i18next'

export function HostPsNote() {
  const { t } = useTranslation()

  return (
    <section
      aria-label={t('footer.psNoteAria')}
      className="border-t border-sand/80 bg-sand/35 py-12 sm:py-16"
    >
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="relative rotate-[-0.6deg] rounded-sm border border-olive/15 bg-[#f7f0e4] px-8 py-8 shadow-md sm:px-10 sm:py-10">
          <div
            className="pointer-events-none absolute -left-1 top-8 h-16 w-3 rounded-r bg-terracotta/20"
            aria-hidden
          />
          <p className="font-handwritten text-2xl leading-snug text-olive sm:text-3xl">
            <span className="font-semibold">{t('footer.psLabel')}</span>{' '}
            {t('footer.psNote')}
          </p>
          <p className="mt-5 font-handwritten text-xl text-stone-muted sm:text-2xl">
            — {t('footer.psSignoff')}
          </p>
        </div>
      </div>
    </section>
  )
}
