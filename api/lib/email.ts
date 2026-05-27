import type { TFunction } from 'i18next'
import { getActivityLineTotal, isGroupPrice, isPriceOnRequest } from './activities'
import {
  formatCurrency,
  getBookingTotal,
  getNightCount,
  parseLocalDate,
  STAY_NIGHTS,
} from './booking'
import type { ActivitySelection, BookingSubmission } from './types'

export type { BookingSubmission } from './types'

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function validateBookingSubmission(
  submission: BookingSubmission,
  t: TFunction,
): string | null {
  const { form, activitySelections } = submission

  if (!form.name?.trim()) return t('booking.errors.name')
  if (!form.email?.trim() || !isValidEmail(form.email)) return t('booking.errors.email')
  if (!form.phone?.trim()) return t('booking.errors.phone')
  if (!form.checkIn || !form.checkOut) return t('booking.errors.checkIn')
  if (form.adults < 1) return t('booking.errors.adults')
  if (form.children < 0) return t('booking.errors.children')
  if (!Array.isArray(activitySelections)) return 'Invalid activities'

  return null
}

function formatActivitySelectionLabel(
  selection: ActivitySelection,
  t: TFunction,
): string {
  const name = t(`activities.items.${selection.id}`)
  if (isGroupPrice(selection.id) || isPriceOnRequest(selection.id)) return name
  const peopleLabel =
    selection.people === 1
      ? t('common.personOne')
      : t('common.personMany', { count: selection.people })
  return `${name} (${peopleLabel})`
}

function formatActivityLinePrice(
  selection: ActivitySelection,
  t: TFunction,
  lang: string,
): string {
  if (isPriceOnRequest(selection.id)) return t('activities.priceOnRequest')
  return formatCurrency(getActivityLineTotal(selection), lang)
}

function buildActivityLines(
  selections: ActivitySelection[],
  t: TFunction,
  lang: string,
): string {
  if (selections.length === 0) return t('common.none')

  return selections
    .map((selection) => {
      const label = formatActivitySelectionLabel(selection, t)
      const price = formatActivityLinePrice(selection, t, lang)
      return `${label} — ${price}`
    })
    .join('\n')
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function buildBookingEmailContent(
  submission: BookingSubmission,
  t: TFunction,
  hostFooterNote = '',
): { subject: string; text: string; html: string } {
  const { form, activitySelections, locale } = submission
  const pricing = getBookingTotal(
    activitySelections,
    form.adults,
    form.children,
  )
  const activityLines = buildActivityLines(activitySelections, t, locale)
  const L = (key: string) => t(`email.labels.${key}`)

  const text = [
    `--- ${t('email.hostHeading')} ---`,
    '',
    `${L('name')}: ${form.name.trim()}`,
    `${L('email')}: ${form.email.trim()}`,
    `${L('phone')}: ${form.phone.trim()}`,
    `${L('checkIn')}: ${form.checkIn}`,
    `${L('checkOut')}: ${form.checkOut}`,
    `Noites: ${getNightCount(parseLocalDate(form.checkIn), parseLocalDate(form.checkOut))} (estadia de ${STAY_NIGHTS} noite)`,
    `${L('adults')}: ${form.adults}`,
    `${L('children')}: ${form.children}`,
    `${L('totalPeople')}: ${pricing.people}`,
    '',
    `${t('email.labels.pricing')}:`,
    `  ${t('email.labels.stay')}: ${formatCurrency(pricing.base, locale)}`,
    `  ${t('email.labels.activitiesMeals')}: ${formatCurrency(pricing.activities, locale)}`,
    `  ${t('email.labels.estimatedTotal')}: ${formatCurrency(pricing.total, locale)}`,
    '',
    `${t('email.labels.activitiesSection')}:`,
    activityLines,
    hostFooterNote,
  ].join('\n')

  const html = `
    <div style="font-family: system-ui, sans-serif; color: #3d3832; max-width: 560px;">
      <h1 style="color: #4a5d3f; font-size: 1.25rem;">${escapeHtml(t('email.hostHeading'))}</h1>
      <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
        <tr><td style="padding: 0.35rem 0; color: #6b6560;">${escapeHtml(L('name'))}</td><td><strong>${escapeHtml(form.name.trim())}</strong></td></tr>
        <tr><td style="padding: 0.35rem 0; color: #6b6560;">${escapeHtml(L('email'))}</td><td><a href="mailto:${escapeHtml(form.email.trim())}">${escapeHtml(form.email.trim())}</a></td></tr>
        <tr><td style="padding: 0.35rem 0; color: #6b6560;">${escapeHtml(L('phone'))}</td><td><a href="tel:${escapeHtml(form.phone.trim())}">${escapeHtml(form.phone.trim())}</a></td></tr>
        <tr><td style="padding: 0.35rem 0; color: #6b6560;">${escapeHtml(L('checkIn'))}</td><td>${escapeHtml(form.checkIn)}</td></tr>
        <tr><td style="padding: 0.35rem 0; color: #6b6560;">${escapeHtml(L('checkOut'))}</td><td>${escapeHtml(form.checkOut)}</td></tr>
        <tr><td style="padding: 0.35rem 0; color: #6b6560;">${escapeHtml(L('adults'))}</td><td>${form.adults}</td></tr>
        <tr><td style="padding: 0.35rem 0; color: #6b6560;">${escapeHtml(L('children'))}</td><td>${form.children}</td></tr>
        <tr><td style="padding: 0.35rem 0; color: #6b6560;">${escapeHtml(L('totalPeople'))}</td><td>${pricing.people}</td></tr>
      </table>
      <p style="margin: 1rem 0 0.5rem; font-weight: 600; color: #4a5d3f;">${escapeHtml(t('email.labels.pricing'))}</p>
      <ul style="margin: 0; padding-left: 1.25rem;">
        <li>${escapeHtml(t('email.labels.stay'))}: <strong>${formatCurrency(pricing.base, locale)}</strong></li>
        <li>${escapeHtml(t('email.labels.activitiesMeals'))}: <strong>${formatCurrency(pricing.activities, locale)}</strong></li>
        <li>${escapeHtml(t('email.labels.estimatedTotal'))}: <strong style="color: #b85c38;">${formatCurrency(pricing.total, locale)}</strong></li>
      </ul>
      <p style="margin: 1.25rem 0 0.5rem; font-weight: 600; color: #4a5d3f;">${escapeHtml(t('email.labels.activitiesSection'))}</p>
      <pre style="white-space: pre-wrap; font-family: inherit; background: #faf6f0; padding: 1rem; border-radius: 8px; margin: 0;">${escapeHtml(activityLines)}</pre>
      ${hostFooterNote ? `<p style="margin-top: 1rem; padding: 0.75rem; background: #fff3e6; border-radius: 8px; font-size: 0.9rem;">${escapeHtml(hostFooterNote.trim())}</p>` : ''}
    </div>
  `.trim()

  const subject = t('email.hostSubject', {
    name: form.name.trim(),
    checkIn: form.checkIn,
    checkOut: form.checkOut,
  })

  return { subject, text, html }
}

export function buildGuestConfirmationEmail(
  submission: BookingSubmission,
  t: TFunction,
): { subject: string; text: string; html: string } {
  const { form, locale } = submission
  const pricing = getBookingTotal(
    submission.activitySelections,
    form.adults,
    form.children,
  )

  const text = [
    t('email.guestGreeting', { name: form.name.trim() }),
    '',
    t('email.guestBody'),
    '',
    `${t('email.labels.checkIn')}: ${form.checkIn}`,
    `${t('email.labels.checkOut')}: ${form.checkOut}`,
    `${t('email.labels.estimatedTotal')}: ${formatCurrency(pricing.total, locale)}`,
    '',
    t('email.guestWhatsApp'),
    '',
    t('email.guestSignoff'),
    t('email.hostSignoff'),
  ].join('\n')

  const html = `
    <div style="font-family: system-ui, sans-serif; color: #3d3832; max-width: 560px;">
      <p>${escapeHtml(t('email.guestGreeting', { name: form.name.trim() }))}</p>
      <p>${escapeHtml(t('email.guestBody'))}</p>
      <ul>
        <li>${escapeHtml(t('email.labels.checkIn'))}: ${escapeHtml(form.checkIn)}</li>
        <li>${escapeHtml(t('email.labels.checkOut'))}: ${escapeHtml(form.checkOut)}</li>
        <li>${escapeHtml(t('email.labels.estimatedTotal'))}: <strong style="color: #b85c38;">${formatCurrency(pricing.total, locale)}</strong></li>
      </ul>
      <p>${escapeHtml(t('email.guestWhatsApp'))}</p>
      <p style="margin-top: 1.5rem;">${escapeHtml(t('email.guestSignoff'))}<br><strong>${escapeHtml(t('email.hostSignoff'))}</strong></p>
    </div>
  `.trim()

  return {
    subject: t('email.guestSubject'),
    text,
    html,
  }
}
