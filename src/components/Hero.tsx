export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80"
          alt="Chalé de pedra com jardim no Alentejo"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone/90 via-stone/40 to-stone/20" />
      </div>

      <div className="relative mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-32 sm:min-h-[75vh] sm:px-6 sm:pb-20 lg:px-8">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-sand">
          Arraiolos · Alentejo
        </p>
        <h1 className="font-display max-w-2xl text-4xl font-semibold leading-tight text-cream sm:text-5xl lg:text-6xl">
          O seu refúgio no coração do Alentejo
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-sand sm:text-lg">
          Chalé independente com jardim, a poucos minutos do centro histórico e dos
          famosos tapetes de Arraiolos. Ideal para casais, famílias ou escapadinhas em
          grupo.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href="#reservar"
            className="inline-flex items-center justify-center rounded-full bg-terracotta px-8 py-3.5 text-center font-semibold text-cream transition-colors hover:bg-terracotta-dark"
          >
            Ver disponibilidade
          </a>
          <a
            href="#sobre"
            className="inline-flex items-center justify-center rounded-full border border-cream/40 px-8 py-3.5 text-center font-medium text-cream transition-colors hover:bg-cream/10"
          >
            Conhecer o espaço
          </a>
        </div>
        <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-cream/20 pt-8 sm:max-w-lg">
          <div>
            <dt className="text-xs uppercase tracking-wide text-sand/80">Hóspedes</dt>
            <dd className="font-display mt-1 text-2xl font-semibold text-cream">Até 4</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-sand/80">Quartos</dt>
            <dd className="font-display mt-1 text-2xl font-semibold text-cream">2</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-sand/80">Fim-de-semana</dt>
            <dd className="font-display mt-1 text-2xl font-semibold text-cream">200€</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
