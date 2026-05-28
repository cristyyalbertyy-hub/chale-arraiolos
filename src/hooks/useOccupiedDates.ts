import { useCallback, useEffect, useState } from 'react'
import { occupiedDates } from '../data/occupiedDates'
import { parseLocalDate } from '../lib/dates'

function datesToDateArray(isoDates: string[]): Date[] {
  return isoDates.map(parseLocalDate)
}

export function useOccupiedDates() {
  const [occupied, setOccupied] = useState<Date[]>(occupiedDates)
  const [frozen, setFrozen] = useState<Date[]>([])
  const [kvEnabled, setKvEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/availability', { cache: 'no-store' })
      if (!response.ok) return
      const data = (await response.json()) as {
        dates?: string[]
        frozenDates?: string[]
        kvEnabled?: boolean
      }
      if (Array.isArray(data.dates)) {
        setOccupied(datesToDateArray(data.dates))
      }
      if (Array.isArray(data.frozenDates)) {
        setFrozen(datesToDateArray(data.frozenDates))
      }
      setKvEnabled(Boolean(data.kvEnabled))
    } catch {
      // mantém fallback estático
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
    const interval = setInterval(() => void refresh(), 60_000)
    return () => clearInterval(interval)
  }, [refresh])

  return { occupiedDates: occupied, frozenDates: frozen, kvEnabled, loading, refresh }
}
