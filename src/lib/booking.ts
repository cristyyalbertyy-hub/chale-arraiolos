import type { ActivitySelection } from '../types/activity'
import type { BookingTotal } from '../types/booking'
import { getActivitiesTotal } from './activities'
import { getIntlLocale } from './locale'

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
  activitySelections: ActivitySelection[],
  adults: number,
  children: number,
): BookingTotal {
  const people = getTotalPeople(adults, children)
  const activities = getActivitiesTotal(activitySelections)
  const base = STAY_BASE_PRICE

  return {
    base,
    activities,
    people,
    total: base + activities,
  }
}

export function formatCurrency(value: number, lang = 'pt'): string {
  return new Intl.NumberFormat(getIntlLocale(lang), {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}
