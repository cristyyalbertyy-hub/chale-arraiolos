/** Noites bloqueadas entre check-in (inclusivo) e check-out (exclusivo). */
export function getStayNightIsos(checkIn: string, checkOut: string): string[] {
  const start = parseIso(checkIn)
  const end = parseIso(checkOut)
  const nights: string[] = []
  const cursor = new Date(start)

  while (cursor < end) {
    nights.push(toIso(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }

  return nights
}

function parseIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toIso(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function uniqueSorted(dates: string[]): string[] {
  return [...new Set(dates)].sort()
}
