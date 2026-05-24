import type { VercelRequest, VercelResponse } from '@vercel/node'

/** GET /api/health — confirma que as funções serverless estão activas */
export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')
  res.status(200).json({
    ok: true,
    service: 'chale-booking-api',
    emailConfigured: Boolean(
      process.env.RESEND_API_KEY?.trim() && process.env.BOOKING_TO_EMAIL?.trim(),
    ),
  })
}
