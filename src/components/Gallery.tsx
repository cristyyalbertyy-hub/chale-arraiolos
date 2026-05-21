const images = [
  {
    src: '/images/galeria-castelo.png',
    alt: 'Vista do castelo de Arraiolos ao entardecer, terraço com relva',
    span: 'col-span-2 row-span-2',
  },
  {
    src: '/images/galeria-quintal-noite.png',
    alt: 'Quintal ao crepúsculo, banco, candeeiros, baloiço e luzes',
    span: '',
  },
  {
    src: '/images/galeria-charca.png',
    alt: 'Pequena piscina e charca no jardim',
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
