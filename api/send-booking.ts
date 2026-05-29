import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'
import {
  buildBookingEmailContent,
  buildGuestConfirmationEmail,
  validateBookingSubmission,
  type BookingSubmission,
} from './lib/email'
import { createServerTranslator, isAppLanguage } from './lib/i18n'
import { createHold } from './lib/calendar-store'
import { HOLD_MINUTES_DAY } from './lib/calendar-types'

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

function isResendTestingRestriction(message: string | undefined): boolean {
  const msg = (message ?? '').toLowerCase()
  return (
    msg.includes('only send') ||
    msg.includes('testing') ||
    msg.includes('your own email') ||
    msg.includes('sandbox')
  )
}

function resendErrorToUser(
  message: string | undefined,
  target: 'host' | 'guest',
): string {
  const msg = (message ?? '').toLowerCase()

  if (msg.includes('domain') || msg.includes('verify') || msg.includes('not verified')) {
    return 'O remetente (BOOKING_FROM_EMAIL) precisa de um domínio verificado na Resend. Para testes use: Chalé do Avô Bedi <onboarding@resend.dev>'
  }

  if (isResendTestingRestriction(message)) {
    if (target === 'guest') {
      return 'A Resend em modo de testes só envia para o email da sua conta. O email do hóspede (diferente do seu) não recebe mensagens até verificar um domínio em resend.com/domains e usar esse domínio em BOOKING_FROM_EMAIL. Para testar agora, use o mesmo email da conta Resend no formulário de reserva.'
    }
    return 'Em modo de testes da Resend, BOOKING_TO_EMAIL tem de ser o mesmo email da conta Resend.'
  }

  if (msg.includes('invalid') && msg.includes('from')) {
    return 'BOOKING_FROM_EMAIL inválido. Use o formato: Chalé do Avô Bedi <onboarding@resend.dev>'
  }

  if (target === 'guest') {
    return 'Não foi possível enviar o email de confirmação ao hóspede. Verifique RESEND_API_KEY e BOOKING_FROM_EMAIL na Vercel (domínio verificado em produção) e faça Redeploy.'
  }

  return 'Falha ao enviar o email da reserva ao anfitrião. Confirme RESEND_API_KEY, BOOKING_TO_EMAIL e BOOKING_FROM_EMAIL na Vercel e faça Redeploy.'
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
    const tHost = createServerTranslator('pt')
    const tGuest = createServerTranslator(guestLocale)

    const validationError = validateBookingSubmission(submission, tGuest)
    if (validationError) {
      return res.status(400).json({ error: validationError })
    }

    const holdResult = await createHold({
      checkIn: submission.form.checkIn,
      checkOut: submission.form.checkOut,
      guestName: submission.form.name.trim(),
      guestEmail: submission.form.email.trim(),
      guestPhone: submission.form.phone.trim(),
    })

    if ('error' in holdResult) {
      if (holdResult.error === 'DATES_UNAVAILABLE') {
        return res.status(409).json({
          error:
            'Essas datas acabaram de ser reservadas por outro hóspede. Escolha outras datas.',
        })
      }
      if (holdResult.error === 'KV_NOT_CONFIGURED') {
        console.warn('Vercel KV não configurado — datas não bloqueadas automaticamente')
      }
    }

    const holdContext =
      'error' in holdResult
        ? undefined
        : {
            holdId: holdResult.hold.id,
            frozen: holdResult.hold.frozen,
            expiresAt: holdResult.hold.expiresAt,
          }

    const guestEmail = buildGuestConfirmationEmail(submission, tGuest, holdContext)
    const resend = new Resend(apiKey)
    const guestAddress = submission.form.email.trim()

    const guestResult = await resend.emails.send({
      from: fromEmail,
      to: [guestAddress],
      subject: guestEmail.subject,
      text: guestEmail.text,
      html: guestEmail.html,
    })

    if (guestResult.error) {
      console.error('Resend guest email error:', guestResult.error, { to: guestAddress })
      return res.status(502).json({
        error: resendErrorToUser(guestResult.error.message, 'guest'),
      })
    }

    const holdNote =
      'error' in holdResult
        ? ''
        : [
            holdResult.hold.frozen
              ? `❄️ Reserva congelada (00h–08h) — pagamento até 08:30 (Lisboa).`
              : `⏱ Reserva pendente (${HOLD_MINUTES_DAY} min).`,
            `O hóspede recebeu os dados de pagamento por email (${guestAddress}).`,
            `Gerir em /gestao — ID: ${holdResult.hold.id}`,
            `Referência de pagamento: CHALE-${holdResult.hold.id.slice(0, 8).toUpperCase()}`,
          ].join('\n')

    const hostEmail = buildBookingEmailContent(submission, tHost, holdNote)

    const hostResult = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: guestAddress,
      subject: hostEmail.subject,
      text: hostEmail.text,
      html: hostEmail.html,
    })

    if (hostResult.error) {
      console.error('Resend host email error:', hostResult.error)
      return res.status(502).json({
        error: resendErrorToUser(hostResult.error.message, 'host'),
      })
    }

    return res.status(200).json({
      ok: true,
      holdId: 'error' in holdResult ? undefined : holdResult.hold.id,
      holdExpiresAt: 'error' in holdResult ? undefined : holdResult.hold.expiresAt,
    })
  } catch (err) {
    console.error('send-booking error:', err)
    const detail = err instanceof Error ? err.message : 'erro desconhecido'
    return res.status(500).json({
      error: `Erro no servidor ao processar a reserva: ${detail}`,
    })
  }
}
