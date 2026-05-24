import type { ActivitySelection } from './types'
import { getActivitiesTotal } from './activities'

export const STAY_NIGHTS = 1
export const STAY_BASE_PRICE = 100

const intlLocales: Record<string, string> = {
  pt: 'pt-PT',
  en: 'en-GB',
  fr: 'fr-FR',
}

export function formatCurrency(value: number, lang = 'pt'): string {
  const locale = intlLocales[lang] ?? intlLocales.pt
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}

export function getBookingTotal(
  activitySelections: ActivitySelection[],
  adults: number,
  children: number,
) {
  const people = adults + children
  const activities = getActivitiesTotal(activitySelections)
  const base = STAY_BASE_PRICE
  return { base, activities, people, total: base + activities }
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
