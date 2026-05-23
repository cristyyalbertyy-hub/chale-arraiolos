import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DateRange, type RangeKeyDict } from 'react-date-range'
import { format, startOfDay } from 'date-fns'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import '../styles/calendar.css'
import { occupiedDates } from '../data/occupiedDates'
import { getDateFnsLocale } from '../lib/locale'
import {
  isOccupiedDate,
  isPastDate,
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

function useCalendarMonths(): number {
  const [months, setMonths] = useState(
    () => (typeof window !== 'undefined' && window.innerWidth >= 640 ? 2 : 1),
  )

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)')
    const update = () => setMonths(mq.matches ? 2 : 1)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return months
}

export function AvailabilityCalendar({
  checkIn,
  checkOut,
  onRangeChange,
  onOccupiedConflict,
}: AvailabilityCalendarProps) {
  const { t, i18n } = useTranslation()
  const months = useCalendarMonths()
  const dateLocale = getDateFnsLocale(i18n.language)
  const dateFormat = t('calendar.dateFormat')

  const ranges = useMemo(
    () => [
      {
        startDate: checkIn ? parseLocalDate(checkIn) : new Date(),
        endDate: checkOut ? parseLocalDate(checkOut) : new Date(),
        key: 'selection',
      },
    ],
    [checkIn, checkOut],
  )

  function handleChange(rangesByKey: RangeKeyDict) {
    const { startDate, endDate } = rangesByKey.selection
    if (!startDate) return

    const start = startOfDay(startDate)
    const end = endDate ? startOfDay(endDate) : start

    if (endDate && rangeOverlapsOccupied(start, end, occupiedDates)) {
      onOccupiedConflict?.()
      return
    }

    onRangeChange(toISODate(start), endDate ? toISODate(end) : '')
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
        <DateRange
          ranges={ranges}
          onChange={handleChange}
          months={months}
          direction="horizontal"
          locale={dateLocale}
          minDate={new Date()}
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
