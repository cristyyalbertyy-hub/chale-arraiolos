import { addMonths, format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { getDateFnsLocale } from '../lib/locale'

interface CalendarMonthNavProps {
  shownDate: Date
  months: number
  canGoPrev: boolean
  canGoNext: boolean
  onPrev: () => void
  onNext: () => void
}

export function CalendarMonthNav({
  shownDate,
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
      ? format(shownDate, 'MMMM yyyy', { locale })
      : `${format(shownDate, 'MMMM', { locale })} – ${format(
          addMonths(shownDate, months - 1),
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
