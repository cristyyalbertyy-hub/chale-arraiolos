export interface HoldEmailContext {
  holdId: string
  frozen?: boolean
  expiresAt: string
}

export function formatExpiryInLisbon(iso: string, locale: string): string {
  const date = new Date(iso)
  return new Intl.DateTimeFormat(locale, {
    timeZone: 'Europe/Lisbon',
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}
