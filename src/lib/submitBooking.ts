import type { BookingFormData } from '../types/booking'
import type { ActivitySelection } from '../types/activity'
import type { BookingSubmission } from './bookingSubmission'

export async function submitBooking(
  submission: Omit<BookingSubmission, 'locale'> & {
    form: BookingFormData
    activitySelections: ActivitySelection[]
  },
  locale: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const response = await fetch('/api/send-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...submission, locale }),
    })

    const data = (await response.json().catch(() => ({}))) as {
      error?: string
    }

    if (!response.ok) {
      return {
        ok: false,
        error:
          data.error ??
          'Não foi possível enviar a reserva. Tente novamente ou contacte-nos por WhatsApp.',
      }
    }

    return { ok: true }
  } catch {
    return {
      ok: false,
      error:
        'Erro de rede ao enviar a reserva. Verifique a ligação e tente novamente.',
    }
  }
}
