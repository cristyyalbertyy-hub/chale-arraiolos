import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DateRange, type RangeKeyDict } from 'react-date-range'
import { addDays, format, startOfDay, startOfMonth } from 'date-fns'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import '../styles/calendar.css'
import { CalendarMonthNav } from './CalendarMonthNav'
import { STAY_NIGHTS } from '../lib/booking'
import { useCalendarNavigation } from '../hooks/useCalendarNavigation'
import { useOccupiedDates } from '../hooks/useOccupiedDates'
import { getDateFnsLocale } from '../lib/locale'
import {
  getNightCount,
  isOccupiedDate,
  isPastDate,
  normalizeStayRange,
  parseLocalDate,
  rangeOverlapsOccupied,
  toISODate,
} from '../lib/dates'

interface AvailabilityCalendarProps {
  checkIn: string
  checkOut: string
  onRangeChange: (checkIn: string, checkOut: string) => void
  onOccupiedConflict?: () => void
}

export function AvailabilityCalendar({
  checkIn,
  checkOut,
  onRangeChange,
  onOccupiedConflict,
}: AvailabilityCalendarProps) {
  const { t, i18n } = useTranslation()
  const { occupiedDates } = useOccupiedDates()
  const {
    months,
    minDate,
    maxDate,
    shownDate,
    syncToMonth,
    handleShownDateChange,
    canGoPrev,
    canGoNext,
    goPrevMonth,
    goNextMonth,
  } = useCalendarNavigation()
  const dateLocale = getDateFnsLocale(i18n.language)
  const dateFormat = t('calendar.dateFormat')

  const labelAnchor = checkIn
    ? startOfMonth(parseLocalDate(checkIn))
    : shownDate

  useEffect(() => {
    if (checkIn) {
      syncToMonth(parseLocalDate(checkIn))
    }
  }, [checkIn, syncToMonth])

  const calendarKey = `${shownDate.getFullYear()}-${shownDate.getMonth()}-${months}`

  const ranges = useMemo(() => {
    const startDate = checkIn ? parseLocalDate(checkIn) : new Date()
    const endDate = checkOut
      ? parseLocalDate(checkOut)
      : checkIn
        ? addDays(parseLocalDate(checkIn), STAY_NIGHTS)
        : startDate

    return [
      {
        startDate,
        endDate,
        key: 'selection',
      },
    ]
  }, [checkIn, checkOut])

  const nightCount =
    checkIn && checkOut
      ? getNightCount(parseLocalDate(checkIn), parseLocalDate(checkOut))
      : 0

  function handleChange(rangesByKey: RangeKeyDict) {
    const { startDate, endDate } = rangesByKey.selection
    if (!startDate) return

    const start = startOfDay(startDate)

    syncToMonth(start)

    if (!endDate) {
      onRangeChange(toISODate(start), '')
      return
    }

    const { checkIn: normalizedIn, checkOut: normalizedOut } = normalizeStayRange(
      start,
      endDate,
    )

    if (rangeOverlapsOccupied(normalizedIn, normalizedOut, occupiedDates)) {
      onOccupiedConflict?.()
      return
    }

    syncToMonth(normalizedIn)
    onRangeChange(toISODate(normalizedIn), toISODate(normalizedOut))
  }

  return (
    <div className="availability-calendar">
      <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-stone-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-green-100 ring-1 ring-green-700/30" />
          {t('calendar.available')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-red-100 ring-1 ring-red-800/30" />
          {t('calendar.occupied')}
        </span>
      </div>

      <div className="chale-calendar overflow-x-auto rounded-xl border border-sand bg-white p-3 sm:p-4">
        <CalendarMonthNav
          labelAnchor={labelAnchor}
          months={months}
          canGoPrev={canGoPrev}
          canGoNext={canGoNext}
          onPrev={goPrevMonth}
          onNext={goNextMonth}
        />
        <DateRange
          key={calendarKey}
          ranges={ranges}
          onChange={handleChange}
          months={months}
          direction="horizontal"
          locale={dateLocale}
          shownDate={shownDate}
          onShownDateChange={handleShownDateChange}
          minDate={minDate}
          maxDate={maxDate}
          showMonthAndYearPickers={false}
          disabledDates={occupiedDates}
          disabledDay={(date) => isOccupiedDate(date, occupiedDates)}
          moveRangeOnFirstSelection={false}
          rangeColors={['#4a5d3f']}
          showDateDisplay={false}
          dayContentRenderer={(date) => {
            const occupied = isOccupiedDate(date, occupiedDates)
            const past = isPastDate(date)
            const className = past
              ? ''
              : occupied
                ? 'day-occupied'
                : 'day-available'

            return <span className={className}>{date.getDate()}</span>
          }}
        />
      </div>

      {(checkIn || checkOut) && (
        <p className="mt-3 text-sm text-stone">
          {checkIn && checkOut ? (
            <>
              <span className="font-medium text-olive">{t('calendar.checkIn')}</span>{' '}
              {format(parseLocalDate(checkIn), dateFormat, { locale: dateLocale })}
              {' · '}
              <span className="font-medium text-olive">{t('calendar.checkOut')}</span>{' '}
              {format(parseLocalDate(checkOut), dateFormat, { locale: dateLocale })}
              <span className="font-medium text-olive">
                {' · '}
                {t(
                  nightCount === 1 ? 'calendar.nightsOne' : 'calendar.nightsMany',
                  { count: nightCount },
                )}
              </span>
            </>
          ) : checkIn ? (
            <>
              <span className="font-medium text-olive">{t('calendar.checkInOnly')}</span>{' '}
              {format(parseLocalDate(checkIn), dateFormat, { locale: dateLocale })}
              <span className="text-stone-muted">{t('calendar.selectCheckout')}</span>
            </>
          ) : null}
        </p>
      )}
    </div>
  )
}
