import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { AdminCalendar, type AdminHold } from '../components/admin/AdminCalendar'

const STORAGE_KEY = 'chale-admin-secret'

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function AdminPage() {
  const { t } = useTranslation()
  const [secret, setSecret] = useState(() => sessionStorage.getItem(STORAGE_KEY) ?? '')
  const [inputSecret, setInputSecret] = useState('')
  const [holds, setHolds] = useState<AdminHold[]>([])
  const [manualBlocks, setManualBlocks] = useState<string[]>([])
  const [kvEnabled, setKvEnabled] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [actionId, setActionId] = useState<string | null>(null)

  const isLoggedIn = Boolean(secret)

  const loadHolds = useCallback(async () => {
    if (!secret) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin-calendar', {
        headers: { Authorization: `Bearer ${secret}` },
      })
      const data = (await response.json()) as {
        holds?: AdminHold[]
        manualBlocks?: string[]
        kvEnabled?: boolean
        error?: string
      }
      if (!response.ok) {
        if (response.status === 401) {
          sessionStorage.removeItem(STORAGE_KEY)
          setSecret('')
        }
        setError(data.error ?? t('admin.errors.load'))
        return
      }
      setHolds(data.holds ?? [])
      setManualBlocks(data.manualBlocks ?? [])
      setKvEnabled(Boolean(data.kvEnabled))
    } catch {
      setError(t('admin.errors.network'))
    } finally {
      setLoading(false)
    }
  }, [secret, t])

  useEffect(() => {
    if (!isLoggedIn) return
    void loadHolds()
    const interval = setInterval(() => void loadHolds(), 15_000)
    return () => clearInterval(interval)
  }, [isLoggedIn, loadHolds])

  function handleLogin(e: FormEvent) {
    e.preventDefault()
    const trimmed = inputSecret.trim()
    if (!trimmed) return
    sessionStorage.setItem(STORAGE_KEY, trimmed)
    setSecret(trimmed)
    setInputSecret('')
  }

  function handleLogout() {
    sessionStorage.removeItem(STORAGE_KEY)
    setSecret('')
    setHolds([])
    setManualBlocks([])
  }

  async function postAdmin(
    payload: Record<string, string | undefined>,
  ): Promise<{ ok: boolean; error?: string }> {
    try {
      const response = await fetch('/api/admin-calendar', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      const data = (await response.json()) as { error?: string }
      if (!response.ok) {
        return { ok: false, error: data.error ?? t('admin.errors.action') }
      }
      await loadHolds()
      return { ok: true }
    } catch {
      return { ok: false, error: t('admin.errors.network') }
    }
  }

  async function runListAction(holdId: string, action: 'confirm' | 'release') {
    setActionId(holdId)
    setError(null)
    const result = await postAdmin({ action, holdId })
    if (!result.ok) setError(result.error ?? t('admin.errors.action'))
    setActionId(null)
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-sand px-4 py-16">
        <div className="mx-auto max-w-md rounded-2xl bg-cream p-8 shadow-sm">
          <h1 className="font-display text-2xl font-semibold text-olive">
            {t('admin.loginTitle')}
          </h1>
          <p className="mt-2 text-sm text-stone-muted">{t('admin.loginHint')}</p>
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-olive">
              {t('admin.password')}
              <input
                type="password"
                value={inputSecret}
                onChange={(e) => setInputSecret(e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone/30 bg-white px-3 py-2"
                autoComplete="current-password"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-full bg-terracotta py-3 font-semibold text-cream hover:bg-terracotta-dark"
            >
              {t('admin.login')}
            </button>
          </form>
          <p className="mt-6 text-center text-sm">
            <a href="/" className="text-terracotta hover:underline">
              {t('admin.backToSite')}
            </a>
          </p>
        </div>
      </div>
    )
  }

  const pending = holds.filter((h) => h.status === 'pending' && !h.expired)
  const confirmed = holds.filter((h) => h.status === 'confirmed')

  return (
    <div className="min-h-screen bg-sand px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold text-olive">
              {t('admin.title')}
            </h1>
            <p className="mt-1 text-sm text-stone-muted">{t('admin.subtitle')}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-stone-muted hover:text-terracotta"
          >
            {t('admin.logout')}
          </button>
        </div>

        {!kvEnabled && (
          <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {t('admin.kvWarning')}
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}

        <section className="mt-8 rounded-2xl bg-cream p-6 shadow-sm">
          <h2 className="font-display text-xl font-semibold text-olive">
            {t('admin.calendar.title')}
          </h2>
          <p className="mt-1 text-sm text-stone-muted">{t('admin.calendar.hint')}</p>
          {loading && holds.length === 0 ? (
            <p className="mt-4 text-sm text-stone-muted">{t('admin.loading')}</p>
          ) : (
            <div className="mt-6">
              <AdminCalendar
                holds={holds}
                manualBlocks={manualBlocks}
                disabled={!kvEnabled}
                onAction={postAdmin}
              />
            </div>
          )}
        </section>

        <section className="mt-6 rounded-2xl bg-cream p-6 shadow-sm">
          <h2 className="font-display text-xl font-semibold text-olive">
            {t('admin.pendingTitle')}
          </h2>
          <p className="mt-1 text-sm text-stone-muted">{t('admin.pendingHint')}</p>

          {pending.length === 0 ? (
            <p className="mt-4 text-sm text-stone-muted">{t('admin.noPending')}</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {pending.map((hold) => (
                <li
                  key={hold.id}
                  className="rounded-xl border border-stone/20 bg-white p-4"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-semibold text-olive">{hold.guestName}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        hold.frozen
                          ? 'bg-purple-100 text-purple-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {hold.frozen
                        ? t('admin.frozenUntil', {
                            time: formatCountdown(hold.remainingSeconds),
                          })
                        : t('admin.countdown', {
                            time: formatCountdown(hold.remainingSeconds),
                          })}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-stone-muted">
                    {hold.checkIn} → {hold.checkOut}
                  </p>
                  <p className="text-sm">
                    <a
                      href={`mailto:${hold.guestEmail}`}
                      className="text-terracotta hover:underline"
                    >
                      {hold.guestEmail}
                    </a>
                    {' · '}
                    <a
                      href={`tel:${hold.guestPhone}`}
                      className="text-terracotta hover:underline"
                    >
                      {hold.guestPhone}
                    </a>
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={actionId === hold.id}
                      onClick={() => void runListAction(hold.id, 'confirm')}
                      className="rounded-full bg-olive px-4 py-2 text-sm font-semibold text-cream hover:bg-olive/90 disabled:opacity-50"
                    >
                      {t('admin.confirmPayment')}
                    </button>
                    <button
                      type="button"
                      disabled={actionId === hold.id}
                      onClick={() => void runListAction(hold.id, 'release')}
                      className="rounded-full border border-stone/40 px-4 py-2 text-sm font-medium text-olive hover:bg-sand disabled:opacity-50"
                    >
                      {t('admin.releaseDates')}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-6 rounded-2xl bg-cream p-6 shadow-sm">
          <h2 className="font-display text-xl font-semibold text-olive">
            {t('admin.confirmedTitle')}
          </h2>
          {confirmed.length === 0 ? (
            <p className="mt-4 text-sm text-stone-muted">{t('admin.noConfirmed')}</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {confirmed.map((hold) => (
                <li
                  key={hold.id}
                  className="rounded-xl border border-olive/20 bg-white px-4 py-3 text-sm"
                >
                  <span className="font-semibold text-olive">{hold.guestName}</span>
                  {hold.source === 'admin' && (
                    <span className="ml-2 rounded bg-stone/10 px-1.5 text-xs text-stone-muted">
                      {t('admin.calendar.manualTag')}
                    </span>
                  )}
                  <span className="text-stone-muted">
                    {' '}
                    — {hold.checkIn} → {hold.checkOut}
                  </span>
                  {hold.adminNote && (
                    <p className="mt-1 text-stone-muted">{hold.adminNote}</p>
                  )}
                  <button
                    type="button"
                    disabled={actionId === hold.id}
                    onClick={() => void runListAction(hold.id, 'release')}
                    className="ml-2 text-terracotta hover:underline disabled:opacity-50"
                  >
                    {t('admin.cancelBooking')}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="mt-8 text-center text-sm">
          <a href="/" className="text-terracotta hover:underline">
            {t('admin.backToSite')}
          </a>
        </p>
      </div>
    </div>
  )
}
