import { activities } from '../../src/data/activities.js'
import { getActivityById } from '../../src/lib/activities.js'
import {
  getBookingTotal,
  getTotalPeople,
  MAX_PEOPLE,
} from '../../src/lib/booking.js'
import { parseLocalDate, rangeOverlapsOccupied } from '../../src/lib/dates.js'
import { occupiedDates } from '../../src/data/occupiedDates.js'
import type { ActivitySelection } from '../../src/types/activity.js'
import type { BookingFormData } from '../../src/types/booking.js'

export interface CheckoutRequestBody {
  form: BookingFormData
  activitySelections: ActivitySelection[]
}

export function validateCheckoutBody(body: unknown): {
  ok: true
  data: CheckoutRequestBody
} | { ok: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Pedido inválido' }
  }

  const { form, activitySelections } = body as CheckoutRequestBody

  if (!form || typeof form !== 'object') {
    return { ok: false, error: 'Dados do formulário em falta' }
  }

  const {
    checkIn,
    checkOut,
    name,
    email,
    phone,
    adults,
    children,
  } = form

  if (!checkIn || !checkOut) {
    return { ok: false, error: 'Selecione as datas de entrada e saída' }
  }

  const start = parseLocalDate(checkIn)
  const end = parseLocalDate(checkOut)
  if (end <= start) {
    return { ok: false, error: 'A data de saída deve ser posterior à entrada' }
  }

  if (rangeOverlapsOccupied(start, end, occupiedDates)) {
    return { ok: false, error: 'O intervalo inclui dias já reservados' }
  }

  if (!name?.trim()) return { ok: false, error: 'Indique o nome' }
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'Indique um email válido' }
  }
  if (!phone?.trim()) return { ok: false, error: 'Indique o telemóvel' }

  const adultsNum = Number(adults)
  const childrenNum = Number(children)
  if (!Number.isInteger(adultsNum) || adultsNum < 1) {
    return { ok: false, error: 'Número de adultos inválido' }
  }
  if (!Number.isInteger(childrenNum) || childrenNum < 0) {
    return { ok: false, error: 'Número de crianças inválido' }
  }

  const people = getTotalPeople(adultsNum, childrenNum)
  if (people > MAX_PEOPLE) {
    return { ok: false, error: `Capacidade máxima: ${MAX_PEOPLE} pessoas` }
  }

  if (!Array.isArray(activitySelections)) {
    return { ok: false, error: 'Actividades inválidas' }
  }

  for (const selection of activitySelections) {
    if (!selection?.id || typeof selection.people !== 'number') {
      return { ok: false, error: 'Seleção de actividade inválida' }
    }
    const activity = getActivityById(selection.id)
    if (!activity) {
      return { ok: false, error: 'Actividade desconhecida' }
    }
    if (selection.people < 1 || selection.people > MAX_PEOPLE) {
      return { ok: false, error: 'Número de participantes inválido numa actividade' }
    }
    if (selection.people > people) {
      return {
        ok: false,
        error: 'Participantes por actividade excedem o total da reserva',
      }
    }
  }

  // Garantir que os IDs existem na lista oficial
  const validIds = new Set(activities.map((a) => a.id))
  if (activitySelections.some((s) => !validIds.has(s.id))) {
    return { ok: false, error: 'Actividade não disponível' }
  }

  return {
    ok: true,
    data: {
      form: {
        checkIn,
        checkOut,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        adults: adultsNum,
        children: childrenNum,
      },
      activitySelections,
    },
  }
}

export function buildStripeLineItems(
  activitySelections: ActivitySelection[],
  adults: number,
  children: number,
) {
  const pricing = getBookingTotal(activitySelections, adults, children)

  const lineItems: {
    price_data: {
      currency: string
      unit_amount: number
      product_data: { name: string; description?: string }
    }
    quantity: number
  }[] = [
    {
      price_data: {
        currency: 'eur',
        unit_amount: Math.round(pricing.base * 100),
        product_data: {
          name: 'Pacote fim-de-semana (casal)',
          description: 'Estadia no Chalé Arraiolos',
        },
      },
      quantity: 1,
    },
  ]

  for (const selection of activitySelections) {
    const activity = getActivityById(selection.id)
    if (!activity) continue

    lineItems.push({
      price_data: {
        currency: 'eur',
        unit_amount: Math.round(activity.pricePerPerson * 100),
        product_data: {
          name: activity.name,
          description: `Actividade · ${selection.people} participante(s)`,
        },
      },
      quantity: selection.people,
    })
  }

  return { lineItems, pricing }
}
