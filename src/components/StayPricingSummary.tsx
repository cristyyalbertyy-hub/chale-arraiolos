import { useTranslation } from 'react-i18next'
import {
  formatCurrency,
  getStayLineLabelKey,
  MAX_PEOPLE,
  STAY_MAIN_OFFER_NIGHTS,
  STAY_PRICE_BY_NIGHTS,
} from '../lib/booking'

interface StayPricingSummaryProps {
  nights?: number
  base?: number
  lang: string
}

export function StayPricingSummary({ nights, base, lang }: StayPricingSummaryProps) {
  const { t } = useTranslation()
  const hasSelection = nights !== undefined && base !== undefined
  const displayNights = hasSelection ? nights : STAY_MAIN_OFFER_NIGHTS
  const displayBase = hasSelection
    ? base
    : STAY_PRICE_BY_NIGHTS[STAY_MAIN_OFFER_NIGHTS]

  return (
    <div className="mt-8 rounded-2xl border border-cream/15 bg-cream/5 p-6">
      <p className="text-sm text-sand">
        {hasSelection
          ? t(getStayLineLabelKey(displayNights), { count: displayNights })
          : t('booking.mainOfferLabel')}
      </p>
      <p className="font-display text-3xl font-semibold text-cream">
        {formatCurrency(displayBase, lang)}
      </p>
      {!hasSelection && (
        <ul className="mt-3 space-y-1 text-sm text-sand/85">
          <li>{t('pricing.package1')}</li>
          <li>{t('pricing.package2')}</li>
          <li>{t('pricing.package4')}</li>
          <li>{t('pricing.package7')}</li>
          <li className="text-sand/70">{t('pricing.extraNightHint')}</li>
        </ul>
      )}
      <p className="mt-2 text-sm text-sand/80">{t('booking.plusActivities')}</p>
      <p className="mt-1 text-sm text-sand/80">
        {t('booking.capacity', { max: MAX_PEOPLE })}
      </p>
    </div>
  )
}
