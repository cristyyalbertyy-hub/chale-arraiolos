import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import {
  buildStripeLineItems,
  validateCheckoutBody,
} from './_lib/validateBooking.js'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

function getAppOrigin(req: VercelRequest): string {
  if (process.env.VITE_APP_URL) return process.env.VITE_APP_URL.replace(/\/$/, '')
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  const host = req.headers['x-forwarded-host'] ?? req.headers.host
  const proto = req.headers['x-forwarded-proto'] ?? 'http'
  if (host) return `${proto}://${host}`
  return 'http://localhost:5173'
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  if (!stripeSecretKey) {
    return res.status(500).json({ error: 'Stripe não configurado no servidor' })
  }

  const validation = validateCheckoutBody(req.body)
  if (!validation.ok) {
    return res.status(400).json({ error: validation.error })
  }

  const { form, activitySelections } = validation.data
  const { lineItems, pricing } = buildStripeLineItems(
    activitySelections,
    form.adults,
    form.children,
  )

  if (pricing.total < 0.5) {
    return res.status(400).json({ error: 'Valor total inválido' })
  }

  const stripe = new Stripe(stripeSecretKey)
  const origin = getAppOrigin(req)

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: form.email,
      line_items: lineItems,
      success_url: `${origin}/obrigado?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#reservar`,
      metadata: {
        guestName: form.name,
        guestPhone: form.phone,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        adults: String(form.adults),
        children: String(form.children),
        activities: activitySelections
          .map((s) => `${s.id}:${s.people}`)
          .join(','),
      },
    })

    if (!session.url) {
      return res.status(500).json({ error: 'Sessão de pagamento sem URL' })
    }

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    const message =
      err instanceof Error ? err.message : 'Erro ao criar sessão de pagamento'
    return res.status(500).json({ error: message })
  }
}
