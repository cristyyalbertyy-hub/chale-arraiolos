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

function getEnv(name: string): string | undefined {
  const value = process.env[name]
  return value?.trim() || undefined
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const apiKey = getEnv('RESEND_API_KEY')
  const toEmail = getEnv('BOOKING_TO_EMAIL')
  const fromEmail =
    getEnv('BOOKING_FROM_EMAIL') ?? 'Chalé Arraiolos <onboarding@resend.dev>'

  if (!apiKey || !toEmail) {
    return res.status(503).json({
      error:
        'Envio de email não configurado no servidor. Contacte a anfitriã por WhatsApp.',
    })
  }

  const submission = req.body as BookingSubmission
  const guestLocale = isAppLanguage(submission.locale)
    ? submission.locale
    : 'pt'
  const hostLocale = 'pt'

  const tHost = createServerTranslator(hostLocale)
  const tGuest = createServerTranslator(guestLocale)

  const validationError = validateBookingSubmission(submission, tGuest)

  if (validationError) {
    return res.status(400).json({ error: validationError })
  }

  const hostEmail = buildBookingEmailContent(submission, tHost)
  const guestEmail = buildGuestConfirmationEmail(submission, tGuest)
  const resend = new Resend(apiKey)

  try {
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
      return res.status(502).json({ error: 'Falha ao enviar a notificação da reserva.' })
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
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('send-booking error:', err)
    return res.status(500).json({ error: 'Erro interno ao enviar o email.' })
  }
}
