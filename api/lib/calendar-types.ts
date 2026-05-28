export const HOLD_MINUTES_DAY = 30
/** @deprecated Use HOLD_MINUTES_DAY */
export const HOLD_MINUTES = HOLD_MINUTES_DAY

/** Fim da janela nocturna (início do «dia» para holds). */
export const NIGHT_WINDOW_END_HOUR = 8
/** Prazo de pagamento para reservas congeladas (00:00–07:59). */
export const NIGHT_HOLD_DEADLINE_HOUR = 8
export const NIGHT_HOLD_DEADLINE_MINUTE = 30

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
  /** Reserva nocturna congelada — datas visíveis em roxo; outro hóspede pode tentar reservar. */
  frozen?: boolean
}

export interface CalendarState {
  holds: BookingHold[]
  /** Noites bloqueadas manualmente (sem reserva) */
  manualBlocks?: string[]
}
