import { useTranslation } from 'react-i18next'
import { BathroomNotice } from './BathroomNotice'
import { CancellationPolicyNotice } from './CancellationPolicy'

export function Hero() {
  const { t } = useTranslation()

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/images/hero-quintal.png"
          alt={t('about.photoGarden')}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone/90 via-stone/40 to-stone/20" />
      </div>

      <div className="relative mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-32 sm:min-h-[75vh] sm:px-6 sm:pb-20 lg:px-8">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-sand">
          {t('hero.location')}
        </p>
        <h1 className="font-display max-w-2xl text-4xl font-semibold leading-tight text-cream sm:text-5xl lg:text-6xl">
          {t('hero.title')}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-sand sm:text-lg">
          {t('hero.subtitle')}
        </p>
        <div className="mt-6 max-w-xl">
          <BathroomNotice variant="hero" />
        </div>
        <div className="mt-8 max-w-xl">
          <CancellationPolicyNotice variant="hero" />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href="#reservar"
            className="inline-flex items-center justify-center rounded-full bg-terracotta px-8 py-3.5 text-center font-semibold text-cream transition-colors hover:bg-terracotta-dark"
          >
            {t('hero.ctaAvailability')}
          </a>
          <a
            href="#sobre"
            className="inline-flex items-center justify-center rounded-full border border-cream/40 px-8 py-3.5 text-center font-medium text-cream transition-colors hover:bg-cream/10"
          >
            {t('hero.ctaDiscover')}
          </a>
          </div>
        </div>
        <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-cream/20 pt-8 sm:max-w-lg">
          <div>
            <dt className="text-xs uppercase tracking-wide text-sand/80">
              {t('hero.guests')}
            </dt>
            <dd className="font-display mt-1 text-2xl font-semibold text-cream">
              {t('hero.guestsValue')}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-sand/80">
              {t('hero.lodging')}
            </dt>
            <dd className="font-display mt-1 text-2xl font-semibold text-cream">
              {t('hero.lodgingValue')}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-sand/80">
              {t('hero.weekend')}
            </dt>
            <dd className="font-display mt-1 text-2xl font-semibold text-cream">
              {t('hero.weekendValue')}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
