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

/** Preço total da estadia por número de noites (pacotes fixos). */
export const STAY_PRICE_BY_NIGHTS: Readonly<Record<number, number>> = {
  1: 100,
  2: 170,
  3: 245,
  4: 330,
  5: 400,
  6: 460,
  7: 550,
}

/** Por noite extra além de 7 noites. */
export const STAY_EXTRA_NIGHT_PRICE = 72

export const STAY_MAIN_OFFER_NIGHTS = 2

/** 1 noite (referência / pacote mínimo). */
export const STAY_BASE_PRICE = STAY_PRICE_BY_NIGHTS[1]
/** @deprecated Use STAY_PRICE_BY_NIGHTS */
export const WEEKEND_BASE_PRICE = STAY_BASE_PRICE

/** @deprecated Use STAY_MAIN_OFFER_NIGHTS */
export const STAY_NIGHTS = STAY_MAIN_OFFER_NIGHTS

export const MAX_PEOPLE = 4

export function getStayBasePrice(nights: number): number {
  const n = Math.max(1, Math.floor(nights))
  if (n <= 7) return STAY_PRICE_BY_NIGHTS[n]
  return STAY_PRICE_BY_NIGHTS[7] + (n - 7) * STAY_EXTRA_NIGHT_PRICE
}

/** Chave i18n para a linha da estadia no resumo. */
export function getStayLineLabelKey(nights: number): string {
  if (nights === 1) return 'pricing.stayOneNight'
  if (nights === 2) return 'pricing.stayWeekend2'
  return 'pricing.stayNights'
}

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
  const base = getStayBasePrice(nights)
  const basePerNight = Math.round((base / nights) * 100) / 100

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
