import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

interface CancellationPolicyProps {
  /** Texto claro no hero; texto escuro no formulário de reserva */
  variant?: 'hero' | 'booking'
}

export function CancellationPolicyNotice({ variant = 'booking' }: CancellationPolicyProps) {
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLDialogElement>(null)

  const isHero = variant === 'hero'
  const textClass = isHero ? 'text-sand/90' : 'text-sand'
  const linkClass = isHero
    ? 'text-cream underline decoration-cream/50 underline-offset-2 hover:decoration-cream'
    : 'text-cream underline decoration-cream/60 underline-offset-2 hover:decoration-cream'

  function openDialog() {
    dialogRef.current?.showModal()
  }

  function closeDialog() {
    dialogRef.current?.close()
  }

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const onCancel = () => closeDialog()
    dialog.addEventListener('cancel', onCancel)
    return () => dialog.removeEventListener('cancel', onCancel)
  }, [])

  return (
    <>
      <p className={`text-xs leading-relaxed sm:text-sm ${textClass}`}>
        {t('cancellation.consent')}{' '}
        <button type="button" onClick={openDialog} className={linkClass}>
          {t('cancellation.openPolicy')}
        </button>
      </p>

      <dialog
        ref={dialogRef}
        className="cancellation-dialog fixed left-1/2 top-1/2 z-[100] w-[min(100%,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border-0 bg-cream p-0 text-olive shadow-xl backdrop:bg-stone/50 sm:w-[min(100%,32rem)]"
        onClick={(e) => {
          if (e.target === dialogRef.current) closeDialog()
        }}
      >
        <div className="max-h-[min(85vh,32rem)] overflow-y-auto p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold text-olive sm:text-2xl">
            {t('cancellation.title')}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-stone-muted">
            {t('cancellation.intro')}
          </p>

          <div className="mt-5 overflow-hidden rounded-xl border border-stone/15">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-olive/10 text-olive">
                  <th className="px-3 py-2.5 font-semibold sm:px-4">
                    {t('cancellation.tableDeadline')}
                  </th>
                  <th className="px-3 py-2.5 font-semibold sm:px-4">
                    {t('cancellation.tableRefund')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone/10 bg-white">
                <tr>
                  <td className="px-3 py-2.5 sm:px-4">{t('cancellation.row1Deadline')}</td>
                  <td className="px-3 py-2.5 sm:px-4">{t('cancellation.row1Refund')}</td>
                </tr>
                <tr>
                  <td className="px-3 py-2.5 sm:px-4">{t('cancellation.row2Deadline')}</td>
                  <td className="px-3 py-2.5 sm:px-4">{t('cancellation.row2Refund')}</td>
                </tr>
                <tr>
                  <td className="px-3 py-2.5 sm:px-4">{t('cancellation.row3Deadline')}</td>
                  <td className="px-3 py-2.5 sm:px-4">{t('cancellation.row3Refund')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-5 text-sm font-medium text-olive">
            {t('cancellation.exceptionsTitle')}
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-stone-muted">
            <li>{t('cancellation.exception1')}</li>
            <li>{t('cancellation.exception2')}</li>
            <li>{t('cancellation.exception3')}</li>
          </ul>

          <p className="mt-5 text-sm leading-relaxed text-stone-muted italic">
            {t('cancellation.closing')}
          </p>
          <p className="mt-3 text-sm font-medium text-olive">{t('cancellation.signoff')}</p>

          <button
            type="button"
            onClick={closeDialog}
            className="mt-6 w-full rounded-full bg-terracotta py-3 text-sm font-semibold text-cream hover:bg-terracotta-dark"
          >
            {t('cancellation.close')}
          </button>
        </div>
      </dialog>
    </>
  )
}
