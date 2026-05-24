import { manualBlockedDates } from './manualBlockedDates'

function parseLocalDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** Fallback local quando a API de disponibilidade não responde */
export const occupiedDates: Date[] = manualBlockedDates.map(parseLocalDate)
