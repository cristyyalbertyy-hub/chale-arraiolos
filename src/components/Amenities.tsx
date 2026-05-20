import { amenities } from '../data/amenities'

export function Amenities() {
  return (
    <section id="comodidades" className="scroll-mt-20 bg-sand/40 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-terracotta">
            Comodidades
          </p>
          <h2 className="font-display mt-2 text-3xl font-semibold text-olive sm:text-4xl">
            Tudo incluído para uma estadia perfeita
          </h2>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {amenities.map((item) => (
            <li
              key={item.label}
              className="rounded-2xl border border-sand bg-cream p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="text-2xl" aria-hidden>
                {item.icon}
              </span>
              <h3 className="mt-3 font-semibold text-stone">{item.label}</h3>
              <p className="mt-1 text-sm leading-relaxed text-stone-muted">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
