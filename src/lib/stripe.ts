import type { BookingFormData } from '../types/booking'
import type { ActivitySelection } from '../types/activity'

export interface CheckoutSessionPayload {
  form: BookingFormData
  activitySelections: ActivitySelection[]
}

export interface CheckoutSessionResponse {
  url?: string
  error?: string
}

export async function createCheckoutSession(
  payload: CheckoutSessionPayload,
): Promise<CheckoutSessionResponse> {
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = (await response.json()) as CheckoutSessionResponse

  if (!response.ok) {
    return { error: data.error ?? 'Não foi possível iniciar o pagamento.' }
  }

  return data
}
