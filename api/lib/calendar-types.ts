export const HOLD_MINUTES = 15
export const CALENDAR_KV_KEY = 'calendar-state'

export type HoldStatus = 'pending' | 'confirmed' | 'cancelled'
export type HoldSource = 'guest' | 'admin'

export interface BookingHold {
  id: string
  checkIn: string
  checkOut: string
  guestName: string
  guestEmail: string
  guestPhone: string
  createdAt: string
  expiresAt: string
  status: HoldStatus
  source?: HoldSource
  adminNote?: string
}

export interface CalendarState {
  holds: BookingHold[]
  /** Noites bloqueadas manualmente (sem reserva) */
  manualBlocks?: string[]
}
