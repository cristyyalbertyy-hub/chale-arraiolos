import { useTranslation } from 'react-i18next'
import { amenities } from '../data/amenities'

export function Amenities() {
  const { t } = useTranslation()

  return (
    <section id="comodidades" className="scroll-mt-20 bg-sand/40 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-terracotta">
            {t('amenities.eyebrow')}
          </p>
          <h2 className="font-display mt-2 text-3xl font-semibold text-olive sm:text-4xl">
            {t('amenities.title')}
          </h2>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {amenities.map((item) => {
            const cardClass =
              'rounded-2xl border border-sand bg-cream p-5 shadow-sm transition-shadow hover:shadow-md'
            const content = (
              <>
                <span className="text-2xl" aria-hidden>
                  {item.icon}
                </span>
                <h3 className="mt-3 font-semibold text-stone">
                  {t(`amenities.${item.id}.label`)}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-stone-muted">
                  {t(`amenities.${item.id}.description`)}
                </p>
                {item.href && (
                  <p className="mt-3 text-sm font-medium text-terracotta">
                    {t('amenities.activitiesLink')}
                  </p>
                )}
              </>
            )

            return (
              <li key={item.id}>
                {item.href ? (
                  <a
                    href={item.href}
                    className={`block ${cardClass} border-terracotta/30 hover:border-terracotta/50`}
                  >
                    {content}
                  </a>
                ) : (
                  <div className={cardClass}>{content}</div>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
