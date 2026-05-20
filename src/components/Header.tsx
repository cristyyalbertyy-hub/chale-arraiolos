import { useState } from 'react'

const navLinks = [
  { href: '#sobre', label: 'O chalé' },
  { href: '#comodidades', label: 'Comodidades' },
  { href: '#galeria', label: 'Galeria' },
  { href: '#actividades', label: 'Actividades' },
  { href: '#reservar', label: 'Reservar' },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-sand/80 bg-cream/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="#" className="group flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-olive text-lg text-cream">
            🏡
          </span>
          <div className="text-left leading-tight">
            <span className="font-display text-lg font-semibold text-olive sm:text-xl">
              Chalé Arraiolos
            </span>
            <span className="block text-xs text-stone-muted">Alentejo, Portugal</span>
          </div>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-stone-muted transition-colors hover:text-terracotta"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#reservar"
            className="rounded-full bg-terracotta px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-terracotta-dark"
          >
            Reservar
          </a>
        </nav>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-stone md:hidden"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <nav className="border-t border-sand bg-cream px-4 py-4 md:hidden">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block rounded-lg px-3 py-2.5 text-base font-medium text-stone hover:bg-sand/60"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <a
                href="#reservar"
                className="block rounded-full bg-terracotta px-4 py-3 text-center font-semibold text-cream"
                onClick={() => setMenuOpen(false)}
              >
                Reservar estadia
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
