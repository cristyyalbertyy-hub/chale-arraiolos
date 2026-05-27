import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

type GalleryImage = {
  src: string
  altKey: string
}

const spaceImages: GalleryImage[] = [
  { src: '/images/galeria_chale.png', altKey: 'gallery.images.chalet' },
  { src: '/images/galeria_relax.PNG', altKey: 'gallery.images.relax' },
  { src: '/images/galeria_sala.jpg', altKey: 'gallery.images.livingRoom' },
  { src: '/images/galeria_varanda.jpg', altKey: 'gallery.images.terrace' },
  { src: '/images/galeria_tree.jpg', altKey: 'gallery.images.gardenTree' },
  { src: '/images/galeria_canas.png', altKey: 'gallery.images.canas' },
  { src: '/images/galeria_tree1.png', altKey: 'gallery.images.treeHouse' },
  { src: '/images/galeria_wc.png', altKey: 'gallery.images.bathroomWc' },
  { src: '/images/galeria_toilete.png', altKey: 'gallery.images.toilete' },
]

const momentImages: GalleryImage[] = [
  { src: '/images/galeria_breackfast.PNG', altKey: 'gallery.images.breakfast' },
  { src: '/images/galeria-cookies.PNG', altKey: 'gallery.images.cookies' },
]

function useLightbox(
  images: GalleryImage[],
  t: ReturnType<typeof useTranslation>['t'],
) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const close = useCallback(() => setLightboxIndex(null), [])

  const showPrev = useCallback(() => {
    setLightboxIndex((i) =>
      i === null ? null : (i - 1 + images.length) % images.length,
    )
  }, [images.length])

  const showNext = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % images.length))
  }, [images.length])

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

  const active =
    lightboxIndex !== null
      ? { ...images[lightboxIndex], alt: t(images[lightboxIndex].altKey) }
      : null

  return { lightboxIndex, setLightboxIndex, close, showPrev, showNext, active }
}

interface ImageGridProps {
  images: GalleryImage[]
  onOpen: (index: number) => void
  t: ReturnType<typeof useTranslation>['t']
}

function ImageGrid({ images, onOpen, t }: ImageGridProps) {
  return (
    <ul className="mt-10 grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
      {images.map((image, index) => {
        const alt = t(image.altKey)
        return (
          <li key={image.src}>
            <button
              type="button"
              onClick={() => onOpen(index)}
              className="group block w-full overflow-hidden rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-olive/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
              aria-label={t('gallery.openImage', { alt })}
            >
              <img
                src={image.src}
                alt={alt}
                className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </button>
          </li>
        )
      })}
    </ul>
  )
}

interface LightboxProps {
  images: GalleryImage[]
  lightboxIndex: number
  active: { src: string; alt: string }
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  t: ReturnType<typeof useTranslation>['t']
}

function Lightbox({
  images,
  lightboxIndex,
  active,
  onClose,
  onPrev,
  onNext,
  t,
}: LightboxProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone/90 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={active.alt}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-cream/10 text-2xl text-cream transition-colors hover:bg-cream/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-cream/50"
        aria-label={t('gallery.close')}
      >
        ×
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onPrev()
        }}
        className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-cream/10 text-2xl text-cream transition-colors hover:bg-cream/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-cream/50 sm:left-4"
        aria-label={t('gallery.prev')}
      >
        ‹
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onNext()
        }}
        className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-cream/10 text-2xl text-cream transition-colors hover:bg-cream/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-cream/50 sm:right-4"
        aria-label={t('gallery.next')}
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
  )
}

function GalleryBlock({
  id,
  eyebrowKey,
  titleKey,
  images,
  className = '',
}: {
  id: string
  eyebrowKey: string
  titleKey: string
  images: GalleryImage[]
  className?: string
}) {
  const { t } = useTranslation()
  const { lightboxIndex, setLightboxIndex, close, showPrev, showNext, active } =
    useLightbox(images, t)

  return (
    <section id={id} className={`scroll-mt-20 ${className}`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-terracotta">
            {t(eyebrowKey)}
          </p>
          <h2 className="font-display mt-2 text-3xl font-semibold text-olive sm:text-4xl">
            {t(titleKey)}
          </h2>
        </div>

        <ImageGrid images={images} onOpen={setLightboxIndex} t={t} />
      </div>

      {active && lightboxIndex !== null && (
        <Lightbox
          images={images}
          lightboxIndex={lightboxIndex}
          active={active}
          onClose={close}
          onPrev={showPrev}
          onNext={showNext}
          t={t}
        />
      )}
    </section>
  )
}

export function Gallery() {
  return (
    <>
      <GalleryBlock
        id="galeria"
        eyebrowKey="gallery.eyebrow"
        titleKey="gallery.spacesTitle"
        images={spaceImages}
        className="py-16 sm:py-24"
      />
      <GalleryBlock
        id="momentos"
        eyebrowKey="gallery.eyebrow"
        titleKey="gallery.momentsTitle"
        images={momentImages}
        className="border-t border-sand bg-white/40 py-16 sm:py-24"
      />
    </>
  )
}
