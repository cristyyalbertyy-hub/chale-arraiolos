import type { BookingFormData } from '../types/booking'
import type { ActivitySelection } from '../types/activity'
import type { BookingSubmission } from '../types/bookingSubmission'

function messageFromJsonBody(text: string): string | null {
  try {
    const data = JSON.parse(text) as { error?: string; message?: string }
    const message = data.error ?? data.message
    if (typeof message === 'string' && message.trim()) {
      return message.trim()
    }
  } catch {
    // not JSON
  }
  return null
}

function messageFromHtmlOrText(text: string, status: number): string | null {
  if (text.includes('<!DOCTYPE') || text.includes('<html')) {
    if (status === 404) {
      return 'O serviço de reservas não está activo no servidor (erro 404). Confirme que o site está na Vercel com a pasta api/ e faça Redeploy do último código.'
    }
    return `Resposta inválida do servidor (${status}). O envio por email pode não estar configurado na Vercel.`
  }

  const snippet = text.replace(/\s+/g, ' ').trim().slice(0, 220)
  if (snippet) {
    return `${snippet}${text.length > 220 ? '…' : ''}`
  }
  return null
}

function messageForStatus(status: number): string {
  switch (status) {
    case 404:
      return 'Serviço de reservas não encontrado (404). É necessário publicar na Vercel com a API incluída e fazer Redeploy.'
    case 503:
      return 'Envio por email não configurado no servidor. Defina RESEND_API_KEY e BOOKING_TO_EMAIL na Vercel (sem VITE_) e faça Redeploy.'
    case 502:
      return 'O servidor não conseguiu enviar o email (Resend). Verifique BOOKING_FROM_EMAIL e BOOKING_TO_EMAIL na Vercel.'
    case 500:
      return 'Erro interno no servidor ao processar a reserva. Tente mais tarde ou contacte por WhatsApp.'
    default:
      return `Não foi possível enviar a reserva (erro ${status}). Tente novamente ou contacte por WhatsApp.`
  }
}

function formatApiError(status: number, detail: string): string {
  if (detail.startsWith('[')) return detail
  return `[${status}] ${detail}`
}

async function readApiError(response: Response, bodyText: string): Promise<string> {
  const fromJson = messageFromJsonBody(bodyText)
  if (fromJson) return formatApiError(response.status, fromJson)

  const fromHtml = messageFromHtmlOrText(bodyText, response.status)
  if (fromHtml) return formatApiError(response.status, fromHtml)

  return formatApiError(response.status, messageForStatus(response.status))
}

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

    const bodyText = await response.text()
    const contentType = response.headers.get('content-type') ?? ''
    const looksLikeHtml =
      contentType.includes('text/html') ||
      bodyText.includes('<!DOCTYPE') ||
      bodyText.includes('<html')

    if (response.ok && looksLikeHtml) {
      return {
        ok: false,
        error: formatApiError(
          response.status,
          'A API de reservas não respondeu (recebeu HTML em vez de JSON). Na Vercel, defina Root Directory = chale-arraiolos, confirme a pasta api/ e faça Redeploy.',
        ),
      }
    }

    if (!response.ok) {
      const error = await readApiError(response, bodyText)
      console.error('Reserva falhou:', response.status, error)
      return { ok: false, error }
    }

    if (!bodyText.trim()) {
      return { ok: true }
    }

    const fromJson = messageFromJsonBody(bodyText)
    if (fromJson) {
      console.error('Reserva falhou (corpo JSON):', fromJson)
      return { ok: false, error: formatApiError(response.status, fromJson) }
    }

    try {
      const data = JSON.parse(bodyText) as { ok?: boolean; error?: string }
      if (data.error) {
        return { ok: false, error: formatApiError(response.status, data.error) }
      }
    } catch {
      return {
        ok: false,
        error: formatApiError(
          response.status,
          'Resposta inesperada do servidor. Teste https://o-seu-dominio/api/health — deve devolver JSON.',
        ),
      }
    }

    return { ok: true }
  } catch (err) {
    console.error('Reserva — erro de rede:', err)
    return {
      ok: false,
      error:
        'Erro de rede ao enviar a reserva. Se estiver em localhost, use o site publicado na Vercel ou execute: npx vercel dev',
    }
  }
}
