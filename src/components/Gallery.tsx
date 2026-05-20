const images = [
  {
    src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    alt: 'Exterior do chalé',
    span: 'col-span-2 row-span-2',
  },
  {
    src: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=500&q=80',
    alt: 'Cozinha moderna',
    span: '',
  },
  {
    src: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=500&q=80',
    alt: 'Detalhe decorativo',
    span: '',
  },
  {
    src: 'https://images.unsplash.com/photo-1600573472591-ee6b8c0c8c0e?w=500&q=80',
    alt: 'Terraço exterior',
    span: '',
  },
  {
    src: 'https://images.unsplash.com/photo-1600566752355-357ed629845f?w=800&q=80',
    alt: 'Piscina e jardim',
    span: 'col-span-2',
  },
]

export function Gallery() {
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

        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:grid-rows-2">
          {images.map((image) => (
            <figure
              key={image.alt}
              className={`overflow-hidden rounded-2xl ${image.span}`}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="h-full min-h-[140px] w-full object-cover transition-transform duration-500 hover:scale-105 sm:min-h-[180px]"
                loading="lazy"
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
