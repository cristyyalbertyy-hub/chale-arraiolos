import { useTranslation } from 'react-i18next'

export function AboutHost() {
  const { t } = useTranslation()

  return (
    <section
      id="anfitria"
      className="scroll-mt-20 border-y border-sand bg-white/60 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-16">
          <div className="shrink-0">
            <img
              src="/images/galeria-afitrian.PNG"
              alt={t('host.photoAlt')}
              className="h-52 w-52 rounded-full object-cover shadow-lg ring-4 ring-olive/15 sm:h-60 sm:w-60 lg:h-72 lg:w-72"
              width={288}
              height={288}
            />
          </div>

          <div className="max-w-2xl text-center lg:text-left">
            <p className="text-sm font-semibold uppercase tracking-widest text-terracotta">
              {t('host.eyebrow')}
            </p>
            <h2 className="font-display mt-2 text-3xl font-semibold text-olive sm:text-4xl">
              {t('host.name')}
            </h2>
            <p className="mt-6 text-base leading-relaxed text-stone-muted">{t('host.bio')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
