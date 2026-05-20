import { useEffect, useMemo, useState } from 'react'
import { DateRange, type RangeKeyDict } from 'react-date-range'
import { format, startOfDay } from 'date-fns'
import { pt } from 'date-fns/locale'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import '../styles/calendar.css'
import { occupiedDates } from '../data/occupiedDates'
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
  const months = useCalendarMonths()

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
          Disponível
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-red-100 ring-1 ring-red-800/30" />
          Ocupado
        </span>
      </div>

      <div className="chale-calendar overflow-x-auto rounded-xl border border-sand bg-white p-3 sm:p-4">
        <DateRange
          ranges={ranges}
          onChange={handleChange}
          months={months}
          direction="horizontal"
          locale={pt}
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
              <span className="font-medium text-olive">Check-in:</span>{' '}
              {format(parseLocalDate(checkIn), "d 'de' MMMM yyyy", { locale: pt })}
              {' · '}
              <span className="font-medium text-olive">Check-out:</span>{' '}
              {format(parseLocalDate(checkOut), "d 'de' MMMM yyyy", { locale: pt })}
            </>
          ) : checkIn ? (
            <>
              <span className="font-medium text-olive">Entrada:</span>{' '}
              {format(parseLocalDate(checkIn), "d 'de' MMMM yyyy", { locale: pt })}
              <span className="text-stone-muted"> — selecione a data de saída</span>
            </>
          ) : null}
        </p>
      )}
    </div>
  )
}
