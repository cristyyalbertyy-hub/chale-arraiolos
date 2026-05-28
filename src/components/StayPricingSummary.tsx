import { useTranslation } from 'react-i18next'
import {
  formatCurrency,
  getStayLineLabelKey,
  MAX_PEOPLE,
} from '../lib/booking'

interface StayPricingSummaryProps {
  lang: string
  /** Total da estadia quando o hóspede já escolheu datas */
  selectionNights?: number
  selectionBase?: number
}

export function StayPricingSummary({
  lang,
  selectionNights,
  selectionBase,
}: StayPricingSummaryProps) {
  const { t } = useTranslation()
  const hasSelection =
    selectionNights !== undefined && selectionBase !== undefined

  return (
    <div className="mt-8 space-y-4">
      <div className="rounded-2xl border border-cream/15 bg-cream/5 p-6">
        <p className="text-sm font-semibold text-sand">{t('pricing.packagesTitle')}</p>
        <ul className="mt-3 space-y-1.5 text-sm text-sand/90">
          <li>{t('pricing.package1')}</li>
          <li>{t('pricing.package2')}</li>
          <li>{t('pricing.package4')}</li>
          <li>{t('pricing.package7')}</li>
          <li className="text-sand/70">{t('pricing.extraNightHint')}</li>
        </ul>
        <p className="mt-3 text-sm text-sand/80">{t('booking.plusActivities')}</p>
        <p className="mt-1 text-sm text-sand/80">
          {t('booking.capacity', { max: MAX_PEOPLE })}
        </p>
      </div>

      {hasSelection && (
        <div className="rounded-2xl border border-terracotta/30 bg-terracotta/10 p-6">
          <p className="text-sm font-semibold text-sand">
            {t('pricing.yourSelectionTitle')}
          </p>
          <p className="font-display mt-2 text-2xl font-semibold text-cream">
            {formatCurrency(selectionBase, lang)}
          </p>
          <p className="mt-1 text-sm text-sand/90">
            {t(getStayLineLabelKey(selectionNights), { count: selectionNights })}
          </p>
        </div>
      )}
    </div>
  )
}
