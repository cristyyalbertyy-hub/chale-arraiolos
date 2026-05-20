import {
  GOOGLE_FORM_ACTION_URL,
  GOOGLE_FORM_ENTRIES,
  isGoogleFormConfigured,
} from '../config/googleForm'
import { formatActivitySelectionLabel } from './activities'
import { formatCurrency, getBookingTotal } from './booking'
import type { BookingFormData } from '../types/booking'
import type { ActivitySelection } from '../types/activity'

export interface BookingSubmission {
  form: BookingFormData
  activitySelections: ActivitySelection[]
}

function buildReservationSummary({
  form,
  activitySelections,
}: BookingSubmission): string {
  const pricing = getBookingTotal(
    activitySelections,
    form.adults,
    form.children,
  )

  const activitiesText =
    activitySelections.length > 0
      ? activitySelections.map(formatActivitySelectionLabel).join('\n')
      : 'Nenhuma'

  return [
    '--- Reserva Chalé Arraiolos ---',
    `Nome: ${form.name}`,
    `Email: ${form.email}`,
    `Telemóvel: ${form.phone}`,
    `Check-in: ${form.checkIn}`,
    `Check-out: ${form.checkOut}`,
    `Adultos: ${form.adults}`,
    `Crianças: ${form.children}`,
    `Total estimado: ${formatCurrency(pricing.total)}`,
    '',
    'Actividades:',
    activitiesText,
  ].join('\n')
}

/**
 * Envia a reserva para o Google Forms via POST (mode no-cors).
 * O Google não devolve resposta legível; assumimos sucesso se não houver erro de rede.
 */
export async function submitToGoogleForm(
  submission: BookingSubmission,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isGoogleFormConfigured()) {
    return {
      ok: false,
      error:
        'O formulário Google ainda não está configurado. Adicione VITE_GOOGLE_FORM_ACTION_URL e VITE_GOOGLE_FORM_ENTRY_RESUMO.',
    }
  }

  const body = new FormData()
  body.append(GOOGLE_FORM_ENTRIES.resumo, buildReservationSummary(submission))

  if (GOOGLE_FORM_ENTRIES.nome) {
    body.append(GOOGLE_FORM_ENTRIES.nome, submission.form.name)
  }
  if (GOOGLE_FORM_ENTRIES.email) {
    body.append(GOOGLE_FORM_ENTRIES.email, submission.form.email)
  }
  if (GOOGLE_FORM_ENTRIES.telefone) {
    body.append(GOOGLE_FORM_ENTRIES.telefone, submission.form.phone)
  }

  try {
    await fetch(GOOGLE_FORM_ACTION_URL, {
      method: 'POST',
      body,
      mode: 'no-cors',
    })
    return { ok: true }
  } catch {
    return {
      ok: false,
      error: 'Erro de rede ao enviar a reserva. Verifique a ligação e tente novamente.',
    }
  }
}
