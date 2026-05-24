import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  isSameDay,
  startOfDay,
} from 'date-fns'
import { STAY_NIGHTS } from './booking'

export function parseLocalDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function isOccupiedDate(date: Date, occupied: Date[]): boolean {
  return occupied.some((d) => isSameDay(d, date))
}

/** Número de noites (check-out no dia da saída, exclusivo). */
export function getNightCount(checkIn: Date, checkOut: Date): number {
  return Math.max(
    0,
    differenceInCalendarDays(startOfDay(checkOut), startOfDay(checkIn)),
  )
}

/**
 * Garante estadia de exactamente STAY_NIGHTS (1 noite → check-out no dia seguinte).
 */
export function normalizeStayRange(
  checkIn: Date,
  checkOut: Date,
): { checkIn: Date; checkOut: Date } {
  const start = startOfDay(checkIn)
  let end = startOfDay(checkOut)
  const nights = getNightCount(start, end)

  if (nights < STAY_NIGHTS) {
    end = addDays(start, STAY_NIGHTS)
  } else if (nights > STAY_NIGHTS) {
    end = addDays(start, STAY_NIGHTS)
  }

  return { checkIn: start, checkOut: end }
}

/** Noites da estadia: check-in inclusivo, check-out exclusivo. */
export function getStayNights(checkIn: Date, checkOut: Date): Date[] {
  const start = startOfDay(checkIn)
  const end = startOfDay(checkOut)
  if (end <= start) return []
  return eachDayOfInterval({ start, end: addDays(end, -1) })
}

export function rangeOverlapsOccupied(
  checkIn: Date,
  checkOut: Date,
  occupied: Date[],
): boolean {
  return getStayNights(checkIn, checkOut).some((night) =>
    isOccupiedDate(night, occupied),
  )
}

export function isPastDate(date: Date): boolean {
  return startOfDay(date) < startOfDay(new Date())
}
