import { useTranslation } from 'react-i18next'
import { GOOGLE_MAPS_EMBED_URL, GOOGLE_MAPS_OPEN_URL } from '../data/location'

const highlights = ['castle', 'center', 'lisbon'] as const

export function Location() {
  const { t } = useTranslation()

  return (
    <section id="localizacao" className="scroll-mt-20 bg-sand/40 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-terracotta">
            {t('location.eyebrow')}
          </p>
          <h2 className="font-display mt-2 text-3xl font-semibold text-olive sm:text-4xl">
            {t('location.title')}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-stone-muted">
            {t('location.intro')}
          </p>
        </div>

        <ul className="mt-8 flex flex-wrap gap-3">
          {highlights.map((key) => (
            <li
              key={key}
              className="rounded-full border border-olive/20 bg-cream px-4 py-2 text-sm font-medium text-olive"
            >
              {t(`location.highlights.${key}`)}
            </li>
          ))}
        </ul>

        <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-8">
          <figure className="overflow-hidden rounded-2xl border border-sand bg-cream shadow-md">
            <img
              src="/images/mapa.png"
              alt={t('location.mapImageAlt')}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <figcaption className="border-t border-sand px-4 py-3 text-center text-sm text-stone-muted">
              {t('location.mapImageCaption')}
            </figcaption>
          </figure>

          <div className="flex min-h-[280px] flex-col overflow-hidden rounded-2xl border border-sand bg-cream shadow-md sm:min-h-[320px]">
            <iframe
              title={t('location.mapEmbedTitle')}
              src={GOOGLE_MAPS_EMBED_URL}
              className="min-h-[280px] w-full flex-1 border-0 sm:min-h-[320px]"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
            <p className="border-t border-sand px-4 py-3 text-center text-sm text-stone-muted">
              <a
                href={GOOGLE_MAPS_OPEN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-terracotta underline decoration-terracotta/40 underline-offset-2 hover:decoration-terracotta"
              >
                {t('location.openInMaps')}
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
