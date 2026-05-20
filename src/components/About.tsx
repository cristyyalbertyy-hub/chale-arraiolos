export function About() {
  return (
    <section id="sobre" className="scroll-mt-20 bg-cream py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-terracotta">
            O chalé
          </p>
          <h2 className="font-display mt-2 text-3xl font-semibold text-olive sm:text-4xl">
            Tradição alentejana, conforto moderno
          </h2>
          <p className="mt-4 text-base leading-relaxed text-stone-muted">
            Este chalé de madeira foi recuperado com respeito pela arquitetura local,
            mantendo o charme rústico e acrescentando todo o conforto para umas férias
            descontraídas. A casa de banho fica no quintal, a cerca de 10 m do chalé
            (fora do alojamento). A sala de estar com lareira, a cozinha totalmente
            equipada e o jardim com churrasqueira convidam a viver o ritmo lento do
            Alentejo.
          </p>
          <p className="mt-4 text-base leading-relaxed text-stone-muted">
            Arraiolos fica a cerca de 2 horas de Lisboa. Passeie pelo castelo, visite os
            ateliers de tapeçaria e prove os vinhos da região — tudo a poucos minutos de
            casa.
          </p>
          <ul className="mt-8 space-y-3">
            {[
              'Check-in flexível (15h–20h)',
              'Estadia mínima de 2 noites',
              'Limpeza final incluída',
              'Toalhas e roupa de cama incluídas',
            ].map((item) => (
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
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80"
            alt="Sala de estar com lareira"
            className="col-span-2 aspect-[4/3] w-full rounded-2xl object-cover shadow-lg"
          />
          <img
            src="https://images.unsplash.com/photo-1600566753190-17f0baa42a8e?w=400&q=80"
            alt="Quarto acolhedor"
            className="aspect-square w-full rounded-2xl object-cover shadow-md"
          />
          <img
            src="https://images.unsplash.com/photo-1600047509807-ba8f86d521b0?w=400&q=80"
            alt="Jardim com vegetação"
            className="aspect-square w-full rounded-2xl object-cover shadow-md"
          />
        </div>
      </div>
    </section>
  )
}
