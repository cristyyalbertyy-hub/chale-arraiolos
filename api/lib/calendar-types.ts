export const HOLD_MINUTES = 15
export const CALENDAR_KV_KEY = 'calendar-state'

export type HoldStatus = 'pending' | 'confirmed' | 'cancelled'

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
}

export interface CalendarState {
  holds: BookingHold[]
}
