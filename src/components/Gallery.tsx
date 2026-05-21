import { useCallback, useEffect, useState } from 'react'

const images = [
  {
    src: '/images/galeria-chale.png',
    alt: 'Chalé de madeira no Alentejo, rodeado de vegetação',
  },
  {
    src: '/images/galeria-castelo.png',
    alt: 'Vista do castelo de Arraiolos ao entardecer, terraço com relva',
  },
  {
    src: '/images/galeria-quintal-noite.png',
    alt: 'Quintal ao crepúsculo, banco, candeeiros, baloiço e luzes',
  },
  {
    src: '/images/galeria-charca.png',
    alt: 'Pequena piscina e charca no jardim',
  },
  {
    src: '/images/galeria_breackfast.PNG',
    alt: 'Pequeno-almoço alentejano na mesa — pão, queijo e azeitonas',
  },
  {
    src: '/images/galeria-cookies.PNG',
    alt: 'Bolachas caseiras frescas do forno',
  },
  {
    src: '/images/galeria-afitrian.PNG',
    alt: 'Momento acolhedor com a anfitriã nas actividades do chalé',
  },
]

export function Gallery() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const close = useCallback(() => setLightboxIndex(null), [])

  const showPrev = useCallback(() => {
    setLightboxIndex((i) =>
      i === null ? null : (i - 1 + images.length) % images.length,
    )
  }, [])

  const showNext = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % images.length))
  }, [])

  useEffect(() => {
    if (lightboxIndex === null) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') showPrev()
      if (e.key === 'ArrowRight') showNext()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [lightboxIndex, close, showPrev, showNext])

  const active = lightboxIndex !== null ? images[lightboxIndex] : null

  return (
    <section id="galeria" className="scroll-mt-20 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-terracotta">
            Galeria
          </p>
          <h2 className="font-display mt-2 text-3xl font-semibold text-olive sm:text-4xl">
            Espaços que vai adorar
          </h2>
        </div>

        <ul className="mt-10 grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3">
          {images.map((image, index) => (
            <li key={image.src}>
              <button
                type="button"
                onClick={() => setLightboxIndex(index)}
                className="group block w-full overflow-hidden rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-olive/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                aria-label={`Abrir imagem: ${image.alt}`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {active && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone/90 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={active.alt}
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-cream/10 text-2xl text-cream transition-colors hover:bg-cream/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-cream/50"
            aria-label="Fechar"
          >
            ×
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              showPrev()
            }}
            className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-cream/10 text-2xl text-cream transition-colors hover:bg-cream/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-cream/50 sm:left-4"
            aria-label="Imagem anterior"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              showNext()
            }}
            className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-cream/10 text-2xl text-cream transition-colors hover:bg-cream/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-cream/50 sm:right-4"
            aria-label="Imagem seguinte"
          >
            ›
          </button>

          <figure
            className="max-h-full max-w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={active.src}
              alt={active.alt}
              className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
            />
            <figcaption className="mt-3 text-center text-sm text-cream/90">
              {lightboxIndex + 1} / {images.length}
            </figcaption>
          </figure>
        </div>
      )}
    </section>
  )
}
