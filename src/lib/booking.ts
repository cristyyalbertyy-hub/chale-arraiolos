import type { ActivitySelection } from '../types/activity'
import type { BookingTotal } from '../types/booking'
import { getActivitiesTotal } from './activities'
import { getNightCount, parseLocalDate } from './dates'

const intlLocales: Record<string, string> = {
  pt: 'pt-PT',
  en: 'en-GB',
  fr: 'fr-FR',
}

function intlLocaleFor(lang: string): string {
  return intlLocales[lang] ?? intlLocales.pt
}

/** Estadia padrão: 1 noite */
export const STAY_NIGHTS = 1
export const STAY_BASE_PRICE = 100
/** @deprecated Use STAY_BASE_PRICE */
export const WEEKEND_BASE_PRICE = STAY_BASE_PRICE
/** Capacidade máxima do Chalé do Avô Bedi */
export const MAX_PEOPLE = 4

export function getTotalPeople(adults: number, children: number): number {
  return adults + children
}

export function getBookingTotal(
  checkIn: string,
  checkOut: string,
  activitySelections: ActivitySelection[],
  adults: number,
  children: number,
): BookingTotal {
  const nights =
    checkIn && checkOut
      ? Math.max(1, getNightCount(parseLocalDate(checkIn), parseLocalDate(checkOut)))
      : 1
  const people = getTotalPeople(adults, children)
  const activities = getActivitiesTotal(activitySelections)
  const basePerNight = STAY_BASE_PRICE
  const base = basePerNight * nights

  return {
    nights,
    basePerNight,
    base,
    activities,
    people,
    total: base + activities,
  }
}

export function formatCurrency(value: number, lang = 'pt'): string {
  return new Intl.NumberFormat(intlLocaleFor(lang), {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}
