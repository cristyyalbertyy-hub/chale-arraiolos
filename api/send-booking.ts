import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'
import {
  buildBookingEmailContent,
  buildGuestConfirmationEmail,
  validateBookingSubmission,
  type BookingSubmission,
} from '../src/lib/bookingSubmission'
import { createServerTranslator } from '../src/i18n/server'
import { isAppLanguage } from '../src/i18n/resources'

const ENV_ALIASES = {
  apiKey: ['RESEND_API_KEY', 'resend_api_key'],
  toEmail: ['BOOKING_TO_EMAIL', 'booking_to_email'],
  fromEmail: ['BOOKING_FROM_EMAIL', 'booking_from_email'],
} as const

function getEnv(names: readonly string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name]?.trim()
    if (value) return value
  }
  return undefined
}

/** Resend exige "Nome <email@dominio.com>" ou só o email */
function normalizeFromAddress(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return 'Chalé do Avô Bedi <onboarding@resend.dev>'
  if (trimmed.includes('@') && !trimmed.includes('<')) {
    return `Chalé do Avô Bedi <${trimmed}>`
  }
  return trimmed
}

function parseSubmission(req: VercelRequest): BookingSubmission | null {
  let body: unknown = req.body

  if (typeof body === 'string') {
    try {
      body = JSON.parse(body) as unknown
    } catch {
      return null
    }
  }

  if (!body || typeof body !== 'object') return null
  return body as BookingSubmission
}

function resendErrorToUser(message: string | undefined): string {
  const msg = (message ?? '').toLowerCase()

  if (msg.includes('domain') || msg.includes('verify') || msg.includes('not verified')) {
    return 'O remetente (BOOKING_FROM_EMAIL) precisa de um domínio verificado na Resend. Para testes use: Chalé do Avô Bedi <onboarding@resend.dev>'
  }

  if (
    msg.includes('only send') ||
    msg.includes('testing') ||
    msg.includes('your own email')
  ) {
    return 'Em modo de testes da Resend, o email de destino (BOOKING_TO_EMAIL) tem de ser o mesmo da conta Resend.'
  }

  if (msg.includes('invalid') && msg.includes('from')) {
    return 'BOOKING_FROM_EMAIL inválido. Use o formato: Chalé do Avô Bedi <onboarding@resend.dev>'
  }

  return 'Falha ao enviar o email da reserva. Confirme RESEND_API_KEY, BOOKING_TO_EMAIL e BOOKING_FROM_EMAIL na Vercel e faça Redeploy.'
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const apiKey = getEnv(ENV_ALIASES.apiKey)
  const toEmail = getEnv(ENV_ALIASES.toEmail)
  const fromEmail = normalizeFromAddress(
    getEnv(ENV_ALIASES.fromEmail) ?? 'onboarding@resend.dev',
  )

  if (!apiKey || !toEmail) {
    console.error('Missing env:', {
      hasApiKey: Boolean(apiKey),
      hasToEmail: Boolean(toEmail),
    })
    return res.status(503).json({
      error:
        'Envio de email não configurado. Na Vercel, defina RESEND_API_KEY e BOOKING_TO_EMAIL (sem VITE_) e faça Redeploy.',
    })
  }

  const submission = parseSubmission(req)
  if (!submission?.form) {
    return res.status(400).json({ error: 'Pedido de reserva inválido.' })
  }

  const guestLocale = isAppLanguage(submission.locale)
    ? submission.locale
    : 'pt'

  try {
    const [tHost, tGuest] = await Promise.all([
      createServerTranslator('pt'),
      createServerTranslator(guestLocale),
    ])

    const validationError = validateBookingSubmission(submission, tGuest)
    if (validationError) {
      return res.status(400).json({ error: validationError })
    }

    const hostEmail = buildBookingEmailContent(submission, tHost)
    const guestEmail = buildGuestConfirmationEmail(submission, tGuest)
    const resend = new Resend(apiKey)

    const hostResult = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: submission.form.email.trim(),
      subject: hostEmail.subject,
      text: hostEmail.text,
      html: hostEmail.html,
    })

    if (hostResult.error) {
      console.error('Resend host email error:', hostResult.error)
      return res.status(502).json({
        error: resendErrorToUser(hostResult.error.message),
      })
    }

    const guestResult = await resend.emails.send({
      from: fromEmail,
      to: [submission.form.email.trim()],
      subject: guestEmail.subject,
      text: guestEmail.text,
      html: guestEmail.html,
    })

    if (guestResult.error) {
      console.error('Resend guest email error:', guestResult.error)
      // Anfitriã já foi notificada — reserva conta como enviada
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('send-booking error:', err)
    return res.status(500).json({
      error:
        'Erro interno ao processar a reserva. Se persistir, contacte-nos por WhatsApp.',
    })
  }
}
