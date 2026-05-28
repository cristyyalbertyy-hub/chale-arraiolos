import { Redis } from '@upstash/redis'
import type { BookingHold, CalendarState } from './calendar-types'
import { CALENDAR_KV_KEY, HOLD_MINUTES } from './calendar-types'
import { getStayNightIsos, uniqueSorted } from './calendar-dates'
import { manualBlockedDates as legacyManualBlocks } from './manual-blocks'
import { getNightCount, parseLocalDate } from './calendar-dates'

function defaultState(): CalendarState {
  return { holds: [], manualBlocks: [] }
}

function getRedis(): Redis | null {
  const url =
    process.env.KV_REST_API_URL?.trim() ??
    process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token =
    process.env.KV_REST_API_TOKEN?.trim() ??
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  if (!url || !token) return null
  return new Redis({ url, token })
}

export function isKvConfigured(): boolean {
  return getRedis() !== null
}

function migrateState(state: CalendarState): CalendarState {
  const holds = state.holds ?? []
  const legacy = new Set(legacyManualBlocks)
  const manualBlocks = (state.manualBlocks ?? []).filter((d) => !legacy.has(d))
  return { holds, manualBlocks: uniqueSorted(manualBlocks) }
}

async function readState(): Promise<CalendarState> {
  const redis = getRedis()
  if (!redis) return migrateState(defaultState())
  const raw = await redis.get<CalendarState>(CALENDAR_KV_KEY)
  return migrateState(raw ?? defaultState())
}

async function writeState(state: CalendarState): Promise<void> {
  const redis = getRedis()
  if (!redis) throw new Error('KV_NOT_CONFIGURED')
  await redis.set(CALENDAR_KV_KEY, state)
}

export function pruneExpiredHolds(state: CalendarState): CalendarState {
  const now = Date.now()
  return {
    ...state,
    holds: state.holds.filter(
      (h) =>
        h.status !== 'pending' ||
        new Date(h.expiresAt).getTime() > now,
    ),
  }
}

function activeHolds(state: CalendarState): BookingHold[] {
  const now = Date.now()
  return state.holds.filter(
    (h) =>
      h.status === 'confirmed' ||
      (h.status === 'pending' && new Date(h.expiresAt).getTime() > now),
  )
}

export function getBlockedDatesFromState(state: CalendarState): string[] {
  const fromHolds = activeHolds(state).flatMap((h) =>
    getStayNightIsos(h.checkIn, h.checkOut),
  )
  return uniqueSorted([...(state.manualBlocks ?? []), ...fromHolds])
}

function validateStayRange(
  checkIn: string,
  checkOut: string,
): { ok: true; nights: string[] } | { error: string } {
  const nights = getStayNightIsos(checkIn, checkOut)
  if (nights.length === 0) return { error: 'INVALID_RANGE' }
  const nightCount = getNightCount(parseLocalDate(checkIn), parseLocalDate(checkOut))
  if (nightCount < 1) return { error: 'INVALID_STAY_LENGTH' }
  return { ok: true, nights }
}

function rangeOverlapsBlocked(
  nights: string[],
  state: CalendarState,
  excludeHoldId?: string,
): boolean {
  const blocked = new Set(getBlockedDatesFromState(state))
  for (const hold of activeHolds(state)) {
    if (excludeHoldId && hold.id === excludeHoldId) continue
    for (const n of getStayNightIsos(hold.checkIn, hold.checkOut)) {
      blocked.add(n)
    }
  }
  return nights.some((d) => blocked.has(d))
}

export async function getBlockedDates(): Promise<{
  dates: string[]
  kvEnabled: boolean
}> {
  let state = await readState()
  const pruned = pruneExpiredHolds(state)
  if (pruned.holds.length !== state.holds.length) {
    state = pruned
    if (isKvConfigured()) await writeState(state)
  }
  return {
    dates: getBlockedDatesFromState(state),
    kvEnabled: isKvConfigured(),
  }
}

export async function createHold(input: {
  checkIn: string
  checkOut: string
  guestName: string
  guestEmail: string
  guestPhone: string
}): Promise<{ hold: BookingHold } | { error: string }> {
  if (!isKvConfigured()) {
    return { error: 'KV_NOT_CONFIGURED' }
  }

  const validated = validateStayRange(input.checkIn, input.checkOut)
  if ('error' in validated) return { error: validated.error }

  let state = pruneExpiredHolds(await readState())
  if (rangeOverlapsBlocked(validated.nights, state)) {
    return { error: 'DATES_UNAVAILABLE' }
  }

  const now = new Date()
  const hold: BookingHold = {
    id: crypto.randomUUID(),
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    guestName: input.guestName,
    guestEmail: input.guestEmail,
    guestPhone: input.guestPhone,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + HOLD_MINUTES * 60_000).toISOString(),
    status: 'pending',
    source: 'guest',
  }

  state.holds.push(hold)
  await writeState(state)
  return { hold }
}

export async function blockDateRange(
  checkIn: string,
  checkOut: string,
): Promise<{ ok: true } | { error: string }> {
  if (!isKvConfigured()) return { error: 'KV_NOT_CONFIGURED' }

  const validated = validateStayRange(checkIn, checkOut)
  if ('error' in validated) return { error: validated.error }

  let state = pruneExpiredHolds(await readState())
  if (rangeOverlapsBlocked(validated.nights, state)) {
    return { error: 'DATES_UNAVAILABLE' }
  }

  state.manualBlocks = uniqueSorted([
    ...(state.manualBlocks ?? []),
    ...validated.nights,
  ])
  await writeState(state)
  return { ok: true }
}

export async function unblockDateRange(
  checkIn: string,
  checkOut: string,
): Promise<{ ok: true } | { error: string }> {
  if (!isKvConfigured()) return { error: 'KV_NOT_CONFIGURED' }

  const validated = validateStayRange(checkIn, checkOut)
  if ('error' in validated) return { error: validated.error }

  const state = pruneExpiredHolds(await readState())
  const remove = new Set(validated.nights)
  state.manualBlocks = (state.manualBlocks ?? []).filter((d) => !remove.has(d))
  await writeState(state)
  return { ok: true }
}

export async function createManualReservation(input: {
  checkIn: string
  checkOut: string
  guestName: string
  guestEmail?: string
  guestPhone?: string
  adminNote?: string
}): Promise<{ hold: BookingHold } | { error: string }> {
  if (!isKvConfigured()) return { error: 'KV_NOT_CONFIGURED' }

  const validated = validateStayRange(input.checkIn, input.checkOut)
  if ('error' in validated) return { error: validated.error }

  let state = pruneExpiredHolds(await readState())
  if (rangeOverlapsBlocked(validated.nights, state)) {
    return { error: 'DATES_UNAVAILABLE' }
  }

  const now = new Date()
  const hold: BookingHold = {
    id: crypto.randomUUID(),
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    guestName: input.guestName.trim(),
    guestEmail: input.guestEmail?.trim() || '—',
    guestPhone: input.guestPhone?.trim() || '—',
    createdAt: now.toISOString(),
    expiresAt: new Date(0).toISOString(),
    status: 'confirmed',
    source: 'admin',
    adminNote: input.adminNote?.trim() || undefined,
  }

  state.holds.push(hold)
  await writeState(state)
  return { hold }
}

export async function listHoldsForAdmin(): Promise<{
  holds: BookingHold[]
  manualBlocks: string[]
  blockedDates: string[]
  kvEnabled: boolean
}> {
  let state = pruneExpiredHolds(await readState())
  if (isKvConfigured()) await writeState(state)
  return {
    holds: state.holds,
    manualBlocks: state.manualBlocks ?? [],
    blockedDates: getBlockedDatesFromState(state),
    kvEnabled: isKvConfigured(),
  }
}

export async function confirmHold(
  holdId: string,
): Promise<{ ok: true } | { error: string }> {
  if (!isKvConfigured()) return { error: 'KV_NOT_CONFIGURED' }

  const state = pruneExpiredHolds(await readState())
  const hold = state.holds.find((h) => h.id === holdId)
  if (!hold) return { error: 'NOT_FOUND' }
  if (hold.status === 'cancelled') return { error: 'ALREADY_CANCELLED' }
  if (hold.status === 'confirmed') return { ok: true }

  hold.status = 'confirmed'
  hold.expiresAt = new Date(0).toISOString()
  await writeState(state)
  return { ok: true }
}

export async function releaseHold(
  holdId: string,
): Promise<{ ok: true } | { error: string }> {
  if (!isKvConfigured()) return { error: 'KV_NOT_CONFIGURED' }

  const state = pruneExpiredHolds(await readState())
  const hold = state.holds.find((h) => h.id === holdId)
  if (!hold) return { error: 'NOT_FOUND' }

  hold.status = 'cancelled'
  await writeState(state)
  return { ok: true }
}

export function remainingSeconds(hold: BookingHold): number {
  if (hold.status !== 'pending') return 0
  return Math.max(
    0,
    Math.floor((new Date(hold.expiresAt).getTime() - Date.now()) / 1000),
  )
}
