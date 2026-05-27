import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  blockDateRange,
  confirmHold,
  createManualReservation,
  listHoldsForAdmin,
  releaseHold,
  remainingSeconds,
  unblockDateRange,
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

const ERROR_MESSAGES: Record<string, string> = {
  KV_NOT_CONFIGURED: 'Base de dados não configurada (Redis/Upstash)',
  NOT_FOUND: 'Reserva não encontrada',
  ALREADY_CANCELLED: 'Reserva já foi libertada',
  DATES_UNAVAILABLE: 'Datas indisponíveis (já ocupadas ou bloqueadas)',
  INVALID_RANGE: 'Intervalo de datas inválido',
  INVALID_STAY_LENGTH: 'A estadia deve ser de 1 noite (check-out no dia seguinte)',
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')

  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Não autorizado' })
  }

  if (req.method === 'GET') {
    try {
      const { holds, manualBlocks, blockedDates, kvEnabled } =
        await listHoldsForAdmin()
      const now = Date.now()
      return res.status(200).json({
        kvEnabled,
        manualBlocks,
        blockedDates,
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
      return res.status(500).json({ error: 'Erro ao listar calendário' })
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  let body: Record<string, unknown> = req.body as Record<string, unknown>
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body) as Record<string, unknown>
    } catch {
      return res.status(400).json({ error: 'Pedido inválido' })
    }
  }

  const action = body.action as string | undefined

  try {
    if (action === 'confirm' || action === 'release') {
      const holdId = body.holdId as string | undefined
      if (!holdId) {
        return res.status(400).json({ error: 'holdId em falta' })
      }
      const result =
        action === 'confirm'
          ? await confirmHold(holdId)
          : await releaseHold(holdId)

      if ('error' in result) {
        return res.status(400).json({
          error: ERROR_MESSAGES[result.error] ?? result.error,
        })
      }
      return res.status(200).json({ ok: true })
    }

    if (action === 'block') {
      const checkIn = body.checkIn as string | undefined
      const checkOut = body.checkOut as string | undefined
      if (!checkIn || !checkOut) {
        return res.status(400).json({ error: 'checkIn e checkOut são obrigatórios' })
      }
      const result = await blockDateRange(checkIn, checkOut)
      if ('error' in result) {
        return res.status(400).json({
          error: ERROR_MESSAGES[result.error] ?? result.error,
        })
      }
      return res.status(200).json({ ok: true })
    }

    if (action === 'unblock') {
      const checkIn = body.checkIn as string | undefined
      const checkOut = body.checkOut as string | undefined
      if (!checkIn || !checkOut) {
        return res.status(400).json({ error: 'checkIn e checkOut são obrigatórios' })
      }
      const result = await unblockDateRange(checkIn, checkOut)
      if ('error' in result) {
        return res.status(400).json({
          error: ERROR_MESSAGES[result.error] ?? result.error,
        })
      }
      return res.status(200).json({ ok: true })
    }

    if (action === 'manualReserve') {
      const checkIn = body.checkIn as string | undefined
      const checkOut = body.checkOut as string | undefined
      const guestName = body.guestName as string | undefined
      if (!checkIn || !checkOut || !guestName?.trim()) {
        return res.status(400).json({
          error: 'checkIn, checkOut e guestName são obrigatórios',
        })
      }
      const result = await createManualReservation({
        checkIn,
        checkOut,
        guestName,
        guestEmail: body.guestEmail as string | undefined,
        guestPhone: body.guestPhone as string | undefined,
        adminNote: body.adminNote as string | undefined,
      })
      if ('error' in result) {
        return res.status(400).json({
          error: ERROR_MESSAGES[result.error] ?? result.error,
        })
      }
      return res.status(200).json({ ok: true, hold: result.hold })
    }

    return res.status(400).json({ error: 'Acção inválida' })
  } catch (err) {
    console.error('admin-calendar POST:', err)
    return res.status(500).json({ error: 'Erro ao actualizar calendário' })
  }
}
