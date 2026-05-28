import { addMonths, format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { getDateFnsLocale } from '../lib/locale'

interface CalendarMonthNavProps {
  /** Mês (ou intervalo) mostrado no título entre as setas */
  labelAnchor: Date
  months: number
  canGoPrev: boolean
  canGoNext: boolean
  onPrev: () => void
  onNext: () => void
}

export function CalendarMonthNav({
  labelAnchor,
  months,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
}: CalendarMonthNavProps) {
  const { t, i18n } = useTranslation()
  const locale = getDateFnsLocale(i18n.language)

  const label =
    months === 1
      ? format(labelAnchor, 'MMMM yyyy', { locale })
      : `${format(labelAnchor, 'MMMM', { locale })} – ${format(
          addMonths(labelAnchor, months - 1),
          'MMMM yyyy',
          { locale },
        )}`

  return (
    <div className="calendar-month-nav mb-3 flex items-center justify-between gap-2">
      <button
        type="button"
        onClick={onPrev}
        disabled={!canGoPrev}
        aria-label={t('calendar.prevMonth')}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-sand bg-cream text-lg font-semibold text-olive transition-colors hover:border-olive/40 hover:bg-sand/60 disabled:cursor-not-allowed disabled:opacity-35"
      >
        ←
      </button>
      <p className="min-w-0 flex-1 text-center text-sm font-semibold capitalize text-olive sm:text-base">
        {label}
      </p>
      <button
        type="button"
        onClick={onNext}
        disabled={!canGoNext}
        aria-label={t('calendar.nextMonth')}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-sand bg-cream text-lg font-semibold text-olive transition-colors hover:border-olive/40 hover:bg-sand/60 disabled:cursor-not-allowed disabled:opacity-35"
      >
        →
      </button>
    </div>
  )
}
