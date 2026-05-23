import { useTranslation } from 'react-i18next'

export function About() {
  const { t } = useTranslation()
  const checklist = t('about.checklist', { returnObjects: true }) as string[]

  return (
    <section id="sobre" className="scroll-mt-20 bg-cream py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-terracotta">
            {t('about.eyebrow')}
          </p>
          <h2 className="font-display mt-2 text-3xl font-semibold text-olive sm:text-4xl">
            {t('about.title')}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-stone-muted">{t('about.p1')}</p>
          <p className="mt-4 text-base leading-relaxed text-stone-muted">{t('about.p2')}</p>
          <ul className="mt-8 space-y-3">
            {checklist.map((item) => (
              <li key={item} className="flex items-start gap-3 text-stone">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-olive/15 text-xs text-olive">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <img
            src="/images/galeria-chale.png"
            alt={t('about.photoChalet')}
            className="col-span-2 aspect-[4/3] w-full rounded-2xl object-cover shadow-lg"
          />
          <img
            src="https://images.unsplash.com/photo-1600566753190-17f0baa42a8e?w=400&q=80"
            alt={t('about.photoRoom')}
            className="aspect-square w-full rounded-2xl object-cover shadow-md"
          />
          <img
            src="/images/galeria-quintal-noite.png"
            alt={t('about.photoGarden')}
            className="aspect-square w-full rounded-2xl object-cover shadow-md"
          />
        </div>
      </div>
    </section>
  )
}
