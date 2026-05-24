import { Redis } from '@upstash/redis'
import type { BookingHold, CalendarState } from './calendar-types'
import { CALENDAR_KV_KEY, HOLD_MINUTES } from './calendar-types'
import { getStayNightIsos, uniqueSorted } from './calendar-dates'
import { manualBlockedDates } from './manual-blocks'

function defaultState(): CalendarState {
  return { holds: [] }
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

async function readState(): Promise<CalendarState> {
  const redis = getRedis()
  if (!redis) return defaultState()
  const state = await redis.get<CalendarState>(CALENDAR_KV_KEY)
  return state ?? defaultState()
}

async function writeState(state: CalendarState): Promise<void> {
  const redis = getRedis()
  if (!redis) throw new Error('KV_NOT_CONFIGURED')
  await redis.set(CALENDAR_KV_KEY, state)
}

export function pruneExpiredHolds(state: CalendarState): CalendarState {
  const now = Date.now()
  return {
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
  return uniqueSorted([...manualBlockedDates, ...fromHolds])
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

  let state = pruneExpiredHolds(await readState())
  const nights = getStayNightIsos(input.checkIn, input.checkOut)
  const blocked = getBlockedDatesFromState(state)
  const overlap = nights.some((d) => blocked.includes(d))
  if (overlap) {
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
  }

  state.holds.push(hold)
  await writeState(state)
  return { hold }
}

export async function listHoldsForAdmin(): Promise<{
  holds: BookingHold[]
  kvEnabled: boolean
}> {
  let state = pruneExpiredHolds(await readState())
  if (isKvConfigured()) await writeState(state)
  return { holds: state.holds, kvEnabled: isKvConfigured() }
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
