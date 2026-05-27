import { useTranslation } from 'react-i18next'

type BathroomNoticeVariant = 'banner' | 'hero' | 'booking'

const messageClasses: Record<BathroomNoticeVariant, string> = {
  banner: 'text-sm leading-relaxed text-amber-950',
  hero: 'rounded-xl border border-cream/40 bg-stone/70 px-4 py-3 text-sm leading-relaxed text-cream backdrop-blur-sm',
  booking:
    'rounded-xl border-2 border-amber-500/60 bg-amber-50 px-4 py-3.5 text-sm leading-relaxed text-amber-950 shadow-sm',
}

interface BathroomNoticeProps {
  variant?: BathroomNoticeVariant
}

export function BathroomNotice({ variant = 'banner' }: BathroomNoticeProps) {
  const { t } = useTranslation()

  const message = (
    <p role="alert" className={messageClasses[variant]}>
      <span className="mr-1" aria-hidden>
        ⚠️
      </span>
      <strong className="font-semibold uppercase tracking-wide">
        {t('bathroomNotice.important')}
      </strong>
      {': '}
      {t('bathroomNotice.message')}
    </p>
  )

  if (variant === 'banner') {
    return (
      <div className="border-b border-amber-700/20 bg-amber-50">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8">{message}</div>
      </div>
    )
  }

  return message
}
