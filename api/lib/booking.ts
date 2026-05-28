import type { ActivitySelection } from './types'
import { getActivitiesTotal } from './activities'

export const STAY_PRICE_BY_NIGHTS: Readonly<Record<number, number>> = {
  1: 100,
  2: 170,
  3: 245,
  4: 330,
  5: 400,
  6: 460,
  7: 550,
}

export const STAY_EXTRA_NIGHT_PRICE = 72
export const STAY_MAIN_OFFER_NIGHTS = 2
export const STAY_BASE_PRICE = STAY_PRICE_BY_NIGHTS[1]
export const STAY_NIGHTS = STAY_MAIN_OFFER_NIGHTS

const intlLocales: Record<string, string> = {
  pt: 'pt-PT',
  en: 'en-GB',
  fr: 'fr-FR',
}

export function getStayBasePrice(nights: number): number {
  const n = Math.max(1, Math.floor(nights))
  if (n <= 7) return STAY_PRICE_BY_NIGHTS[n]
  return STAY_PRICE_BY_NIGHTS[7] + (n - 7) * STAY_EXTRA_NIGHT_PRICE
}

export function formatCurrency(value: number, lang = 'pt'): string {
  const locale = intlLocales[lang] ?? intlLocales.pt
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}

export function getBookingTotal(
  checkIn: string,
  checkOut: string,
  activitySelections: ActivitySelection[],
  adults: number,
  children: number,
) {
  const nights =
    checkIn && checkOut
      ? Math.max(1, getNightCount(parseLocalDate(checkIn), parseLocalDate(checkOut)))
      : 1
  const people = adults + children
  const activities = getActivitiesTotal(activitySelections)
  const base = getStayBasePrice(nights)
  const basePerNight = Math.round((base / nights) * 100) / 100
  return { nights, basePerNight, base, activities, people, total: base + activities }
}

export function parseLocalDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function getNightCount(checkIn: Date, checkOut: Date): number {
  const start = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate())
  const end = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate())
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 86_400_000))
}
