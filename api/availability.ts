import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getBlockedDates } from './lib/calendar-store'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')

  if (_req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { dates, frozenDates, kvEnabled } = await getBlockedDates()
    return res.status(200).json({ dates, frozenDates, kvEnabled })
  } catch (err) {
    console.error('availability error:', err)
    return res.status(500).json({ error: 'Erro ao obter disponibilidade' })
  }
}
