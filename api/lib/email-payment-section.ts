import type { TFunction } from 'i18next'
import type { PaymentDetails } from './payment-config'
import { formatPaymentReference, hasPaymentDetails } from './payment-config'
import type { HoldEmailContext } from './hold-email'
import { formatExpiryInLisbon } from './hold-email'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function buildPaymentSectionText(
  t: TFunction,
  payment: PaymentDetails,
  hold: HoldEmailContext,
  totalFormatted: string,
  locale: string,
): string[] {
  const lines: string[] = [
    '',
    t('email.guestPaymentTitle'),
    '',
    hold.frozen
      ? t('email.guestPayDeadlineFrozen', {
          deadline: formatExpiryInLisbon(hold.expiresAt, locale),
        })
      : t('email.guestPayDeadlineDay', {
          deadline: formatExpiryInLisbon(hold.expiresAt, locale),
        }),
    '',
    t('email.guestPayAmount', { amount: totalFormatted }),
    t('email.guestPayReference', { reference: formatPaymentReference(hold.holdId) }),
    '',
    t('email.guestCancellationAccept'),
    t('cancellation.summary'),
    '',
  ]

  if (!hasPaymentDetails(payment)) {
    lines.push(t('email.guestPaymentPendingContact'))
    return lines
  }

  lines.push(t('email.guestPaymentMethods'))
  if (payment.multibanco) {
    lines.push(`${t('email.paymentMultibanco')}: ${payment.multibanco}`)
  }
  if (payment.mbway) {
    lines.push(`${t('email.paymentMbway')}: ${payment.mbway}`)
  }
  if (payment.iban) {
    lines.push(`${t('email.paymentIban')}: ${payment.iban}`)
  }
  if (payment.revolut) {
    lines.push(`${t('email.paymentRevolut')}: ${payment.revolut}`)
  }

  lines.push('', t('email.guestPaymentAfter'))
  return lines
}

export function buildPaymentSectionHtml(
  t: TFunction,
  payment: PaymentDetails,
  hold: HoldEmailContext,
  totalFormatted: string,
  locale: string,
): string {
  const deadline = hold.frozen
    ? t('email.guestPayDeadlineFrozen', {
        deadline: formatExpiryInLisbon(hold.expiresAt, locale),
      })
    : t('email.guestPayDeadlineDay', {
        deadline: formatExpiryInLisbon(hold.expiresAt, locale),
      })

  const methods: string[] = []
  if (payment.multibanco) {
    methods.push(
      `<li><strong>${escapeHtml(t('email.paymentMultibanco'))}</strong>: ${escapeHtml(payment.multibanco)}</li>`,
    )
  }
  if (payment.mbway) {
    methods.push(
      `<li><strong>${escapeHtml(t('email.paymentMbway'))}</strong>: ${escapeHtml(payment.mbway)}</li>`,
    )
  }
  if (payment.iban) {
    methods.push(
      `<li><strong>${escapeHtml(t('email.paymentIban'))}</strong>: ${escapeHtml(payment.iban)}</li>`,
    )
  }
  if (payment.revolut) {
    methods.push(
      `<li><strong>${escapeHtml(t('email.paymentRevolut'))}</strong>: ${escapeHtml(payment.revolut)}</li>`,
    )
  }

  const methodsBlock = hasPaymentDetails(payment)
    ? `<ul style="margin: 0.5rem 0; padding-left: 1.25rem;">${methods.join('')}</ul>`
    : `<p style="margin: 0.5rem 0;">${escapeHtml(t('email.guestPaymentPendingContact'))}</p>`

  return `
    <div style="margin: 1.25rem 0; padding: 1rem; background: #faf6f0; border-radius: 8px; border: 1px solid #e8dfd0;">
      <p style="margin: 0 0 0.75rem; font-weight: 600; color: #4a5d3f;">${escapeHtml(t('email.guestPaymentTitle'))}</p>
      <p style="margin: 0 0 0.5rem; font-size: 0.95rem;">${escapeHtml(deadline)}</p>
      <p style="margin: 0 0 0.5rem;"><strong>${escapeHtml(t('email.guestPayAmount', { amount: totalFormatted }))}</strong></p>
      <p style="margin: 0 0 0.75rem; font-size: 0.9rem;">${escapeHtml(t('email.guestPayReference', { reference: formatPaymentReference(hold.holdId) }))}</p>
      ${methodsBlock}
      <p style="margin: 0.75rem 0 0; font-size: 0.85rem; color: #6b6560;">${escapeHtml(t('email.guestCancellationAccept'))}<br>${escapeHtml(t('cancellation.summary'))}</p>
      <p style="margin: 0.75rem 0 0; font-size: 0.9rem;">${escapeHtml(t('email.guestPaymentAfter'))}</p>
    </div>
  `.trim()
}
