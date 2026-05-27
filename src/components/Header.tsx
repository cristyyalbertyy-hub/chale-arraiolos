import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './LanguageSwitcher'

const navLinks = [
  { href: '#sobre', key: 'nav.chalet' },
  { href: '#anfitria', key: 'nav.host' },
  { href: '#comodidades', key: 'nav.amenities' },
  { href: '#galeria', key: 'nav.gallery' },
  { href: '#actividades', key: 'nav.activities' },
  { href: '#reservar', key: 'nav.book' },
] as const

export function Header() {
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-sand/80 bg-cream/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <a href="#" className="group flex min-w-0 items-center gap-2">
          <img
            src="/images/goat_circulo.png"
            alt={t('common.brand')}
            className="h-9 w-9 shrink-0 rounded-lg object-cover ring-1 ring-sand/70 bg-cream"
            width={36}
            height={36}
            decoding="async"
          />
          <div className="min-w-0 text-left leading-tight">
            <span className="font-display text-lg font-semibold text-olive sm:text-xl">
              {t('common.brand')}
            </span>
            <span className="block text-xs text-stone-muted">{t('common.region')}</span>
          </div>
        </a>

        <nav className="hidden items-center gap-6 lg:gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-stone-muted transition-colors hover:text-terracotta"
            >
              {t(link.key)}
            </a>
          ))}
          <LanguageSwitcher />
          <a
            href="#reservar"
            className="rounded-full bg-terracotta px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-terracotta-dark"
          >
            {t('nav.book')}
          </a>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-stone"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
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
                  {t(link.key)}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <a
                href="#reservar"
                className="block rounded-full bg-terracotta px-4 py-3 text-center font-semibold text-cream"
                onClick={() => setMenuOpen(false)}
              >
                {t('nav.bookStay')}
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
