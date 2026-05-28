import { useEffect, useRef, type RefObject } from 'react'
import { useTranslation } from 'react-i18next'

function useCancellationPolicyDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null)

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

  return { dialogRef, openDialog, closeDialog }
}

function CancellationPolicyDialog({
  dialogRef,
  onClose,
}: {
  dialogRef: RefObject<HTMLDialogElement | null>
  onClose: () => void
}) {
  const { t } = useTranslation()

  return (
    <dialog
      ref={dialogRef}
      className="cancellation-dialog fixed left-1/2 top-1/2 z-[100] w-[min(100%,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border-0 bg-cream p-0 text-olive shadow-xl backdrop:bg-stone/50 sm:w-[min(100%,32rem)]"
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose()
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
          onClick={onClose}
          className="mt-6 w-full rounded-full bg-terracotta py-3 text-sm font-semibold text-cream hover:bg-terracotta-dark"
        >
          {t('cancellation.close')}
        </button>
      </div>
    </dialog>
  )
}

interface CancellationPolicyProps {
  /** Texto claro no hero; texto escuro no formulário de reserva */
  variant?: 'hero' | 'booking'
}

export function CancellationPolicyNotice({ variant = 'booking' }: CancellationPolicyProps) {
  const { t } = useTranslation()
  const { dialogRef, openDialog, closeDialog } = useCancellationPolicyDialog()

  const isHero = variant === 'hero'
  const summaryClass = isHero ? 'text-sand' : 'text-stone'
  const consentClass = isHero ? 'text-sand/90' : 'text-stone-muted'
  const linkClass = isHero
    ? 'text-cream underline decoration-cream/50 underline-offset-2 hover:decoration-cream'
    : 'text-terracotta underline decoration-terracotta/40 underline-offset-2 hover:decoration-terracotta'

  return (
    <>
      <div
        className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${
          isHero
            ? 'border-cream/20 bg-cream/5'
            : 'border-olive/15 bg-sand/50'
        }`}
      >
        <p className={`font-medium ${summaryClass}`}>
          {t('cancellation.summary')}
        </p>
        <p className={`mt-2 text-xs sm:text-sm ${consentClass}`}>
          {t('cancellation.consent')}{' '}
          <button type="button" onClick={openDialog} className={linkClass}>
            {t('cancellation.openPolicy')}
          </button>
        </p>
      </div>

      <CancellationPolicyDialog dialogRef={dialogRef} onClose={closeDialog} />
    </>
  )
}

export function CancellationPolicyFooter() {
  const { t } = useTranslation()
  const { dialogRef, openDialog, closeDialog } = useCancellationPolicyDialog()

  return (
    <>
      <details className="group mt-8 w-full border-t border-sand pt-6 text-sm text-stone-muted">
        <summary className="cursor-pointer list-none font-medium text-olive marker:content-none hover:text-terracotta [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2">
            <span
              className="text-terracotta transition-transform group-open:rotate-90"
              aria-hidden
            >
              ›
            </span>
            {t('footer.cancellationTitle')}
          </span>
        </summary>
        <ul className="mt-3 max-w-2xl space-y-1.5 leading-relaxed">
          <li>{t('footer.cancellationLine1')}</li>
          <li>{t('footer.cancellationLine2')}</li>
          <li>{t('footer.cancellationLine3')}</li>
        </ul>
        <button
          type="button"
          onClick={openDialog}
          className="mt-3 text-sm font-medium text-terracotta underline decoration-terracotta/40 underline-offset-2 hover:decoration-terracotta"
        >
          {t('cancellation.openPolicy')}
        </button>
      </details>

      <CancellationPolicyDialog dialogRef={dialogRef} onClose={closeDialog} />
    </>
  )
}
