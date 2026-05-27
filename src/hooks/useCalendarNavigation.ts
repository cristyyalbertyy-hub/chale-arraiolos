import { useMemo, useState } from 'react'
import {
  addMonths,
  addYears,
  endOfDay,
  isAfter,
  isBefore,
  startOfDay,
  startOfMonth,
  subMonths,
} from 'date-fns'
import { useCalendarMonths } from './useCalendarMonths'

export function useCalendarNavigation() {
  const months = useCalendarMonths()
  const minDate = useMemo(() => startOfDay(new Date()), [])
  const maxDate = useMemo(() => endOfDay(addYears(minDate, 1)), [minDate])
  const minShown = useMemo(() => startOfMonth(minDate), [minDate])
  const maxShown = useMemo(
    () => startOfMonth(subMonths(addYears(minDate, 1), months - 1)),
    [minDate, months],
  )

  const [shownDate, setShownDate] = useState(() => startOfMonth(new Date()))

  const canGoPrev = isAfter(shownDate, minShown)
  const canGoNext = isBefore(shownDate, maxShown)

  function goPrevMonth() {
    if (!canGoPrev) return
    setShownDate((d) => subMonths(d, 1))
  }

  function goNextMonth() {
    if (!canGoNext) return
    setShownDate((d) => addMonths(d, 1))
  }

  return {
    months,
    minDate,
    maxDate,
    shownDate,
    setShownDate,
    canGoPrev,
    canGoNext,
    goPrevMonth,
    goNextMonth,
  }
}
