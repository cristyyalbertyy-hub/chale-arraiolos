import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  confirmHold,
  listHoldsForAdmin,
  releaseHold,
  remainingSeconds,
} from './lib/calendar-store'

function getAdminSecret(req: VercelRequest): string | undefined {
  const auth = req.headers.authorization
  if (auth?.startsWith('Bearer ')) {
    return auth.slice(7).trim()
  }
  const body = req.body as { secret?: string } | undefined
  if (typeof body?.secret === 'string') return body.secret.trim()
  return undefined
}

function isAuthorized(req: VercelRequest): boolean {
  const expected = process.env.ADMIN_SECRET?.trim()
  const provided = getAdminSecret(req)
  return Boolean(expected && provided && expected === provided)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')

  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Não autorizado' })
  }

  if (req.method === 'GET') {
    try {
      const { holds, kvEnabled } = await listHoldsForAdmin()
      const now = Date.now()
      return res.status(200).json({
        kvEnabled,
        holds: holds
          .filter((h) => h.status !== 'cancelled')
          .map((h) => ({
            ...h,
            remainingSeconds: remainingSeconds(h),
            expired: h.status === 'pending' && new Date(h.expiresAt).getTime() <= now,
          })),
      })
    } catch (err) {
      console.error('admin-calendar GET:', err)
      return res.status(500).json({ error: 'Erro ao listar reservas' })
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  let body: { action?: string; holdId?: string } = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body) as { action?: string; holdId?: string }
    } catch {
      return res.status(400).json({ error: 'Pedido inválido' })
    }
  }

  const { action, holdId } = body ?? {}
  if (!holdId || (action !== 'confirm' && action !== 'release')) {
    return res.status(400).json({ error: 'Acção ou holdId inválidos' })
  }

  try {
    const result =
      action === 'confirm' ? await confirmHold(holdId) : await releaseHold(holdId)

    if ('error' in result) {
      const messages: Record<string, string> = {
        KV_NOT_CONFIGURED: 'Base de dados não configurada (Vercel KV)',
        NOT_FOUND: 'Reserva não encontrada',
        ALREADY_CANCELLED: 'Reserva já foi libertada',
      }
      return res.status(400).json({
        error: messages[result.error] ?? result.error,
      })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('admin-calendar POST:', err)
    return res.status(500).json({ error: 'Erro ao actualizar reserva' })
  }
}
