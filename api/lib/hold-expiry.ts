import { HOLD_MINUTES_DAY, NIGHT_HOLD_DEADLINE_HOUR, NIGHT_HOLD_DEADLINE_MINUTE, NIGHT_WINDOW_END_HOUR } from './calendar-types'

export function getLisbonDateParts(date: Date): {
  year: number
  month: number
  day: number
  hour: number
  minute: number
} {
  const dtf = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Lisbon',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  })
  const parts = Object.fromEntries(
    dtf.formatToParts(date).map((p) => [p.type, p.value]),
  )
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  }
}

/** Instante UTC para uma hora civil em Lisboa (inclui DST). */
export function lisbonLocalToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): Date {
  let utc = Date.UTC(year, month - 1, day, hour, minute)
  for (let i = 0; i < 8; i++) {
    const p = getLisbonDateParts(new Date(utc))
    const targetMs = Date.UTC(year, month - 1, day, hour, minute)
    const actualMs = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute)
    utc += targetMs - actualMs
  }
  return new Date(utc)
}

export function computeHoldExpiry(createdAt: Date): { expiresAt: Date; frozen: boolean } {
  const { hour, minute, year, month, day } = getLisbonDateParts(createdAt)
  const minutesSinceMidnight = hour * 60 + minute
  const dayStartMinutes = NIGHT_WINDOW_END_HOUR * 60

  // 00:00–07:59 (Lisboa): congelado até pagamento às 08:30
  if (minutesSinceMidnight < dayStartMinutes) {
    return {
      expiresAt: lisbonLocalToUtc(
        year,
        month,
        day,
        NIGHT_HOLD_DEADLINE_HOUR,
        NIGHT_HOLD_DEADLINE_MINUTE,
      ),
      frozen: true,
    }
  }

  return {
    expiresAt: new Date(createdAt.getTime() + HOLD_MINUTES_DAY * 60_000),
    frozen: false,
  }
}
