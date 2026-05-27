import { useTranslation } from 'react-i18next'

export function Testimonials() {
  const { t } = useTranslation()

  return (
    <section className="bg-cream py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-semibold uppercase tracking-widest text-terracotta">
          {t('testimonials.eyebrow')}
        </p>
        <h2 className="font-display mt-2 text-center text-2xl font-semibold text-olive sm:text-3xl">
          {t('testimonials.title')}
        </h2>

        <figure className="mt-10 rounded-2xl border border-sand bg-white p-8 shadow-sm sm:p-10">
          <div className="text-terracotta" aria-hidden>
            ★★★★★
          </div>
          <blockquote className="mt-4 text-lg leading-relaxed text-stone sm:text-xl">
            <p>«{t('testimonials.alexandra.quote')}»</p>
          </blockquote>
          <figcaption className="mt-6 text-sm font-semibold text-olive">
            — {t('testimonials.alexandra.author')}
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
