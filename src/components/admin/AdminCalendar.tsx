import { useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { DateRange, type RangeKeyDict } from 'react-date-range'
import { addDays, format, startOfDay, startOfMonth } from 'date-fns'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import '../../styles/calendar.css'
import { CalendarMonthNav } from '../CalendarMonthNav'
import { STAY_NIGHTS } from '../../lib/booking'
import { useCalendarNavigation } from '../../hooks/useCalendarNavigation'
import { getDateFnsLocale } from '../../lib/locale'
import {
  getNightCount,
  normalizeStayRange,
  parseLocalDate,
  toISODate,
} from '../../lib/dates'

export interface AdminHold {
  id: string
  checkIn: string
  checkOut: string
  guestName: string
  guestEmail: string
  guestPhone: string
  status: 'pending' | 'confirmed' | 'cancelled'
  source?: 'guest' | 'admin'
  adminNote?: string
  expiresAt: string
  remainingSeconds: number
  expired: boolean
}

interface AdminCalendarProps {
  holds: AdminHold[]
  manualBlocks: string[]
  disabled?: boolean
  onAction: (
    payload: Record<string, string | undefined>,
  ) => Promise<{ ok: boolean; error?: string }>
}

function isoSet(dates: string[]): Set<string> {
  return new Set(dates)
}

export function AdminCalendar({
  holds,
  manualBlocks,
  disabled,
  onAction,
}: AdminCalendarProps) {
  const { t, i18n } = useTranslation()
  const {
    months,
    minDate,
    maxDate,
    shownDate,
    syncToMonth,
    handleShownDateChange,
    canGoPrev,
    canGoNext,
    goPrevMonth,
    goNextMonth,
  } = useCalendarNavigation()
  const dateLocale = getDateFnsLocale(i18n.language)
  const dateFormat = t('calendar.dateFormat')

  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const labelAnchor = checkIn
    ? startOfMonth(parseLocalDate(checkIn))
    : shownDate

  const calendarKey = `${shownDate.getFullYear()}-${shownDate.getMonth()}-${months}`

  const activeHolds = useMemo(
    () =>
      holds.filter(
        (h) =>
          h.status === 'confirmed' ||
          (h.status === 'pending' && !h.expired),
      ),
    [holds],
  )

  const pendingDates = useMemo(() => {
    const set = new Set<string>()
    for (const h of activeHolds.filter((x) => x.status === 'pending')) {
      let d = parseLocalDate(h.checkIn)
      const end = parseLocalDate(h.checkOut)
      while (d < end) {
        set.add(toISODate(d))
        d = addDays(d, 1)
      }
    }
    return set
  }, [activeHolds])

  const confirmedDates = useMemo(() => {
    const set = new Set<string>()
    for (const h of activeHolds.filter((x) => x.status === 'confirmed')) {
      let d = parseLocalDate(h.checkIn)
      const end = parseLocalDate(h.checkOut)
      while (d < end) {
        set.add(toISODate(d))
        d = addDays(d, 1)
      }
    }
    return set
  }, [activeHolds])

  const manualOnlyDates = useMemo(() => {
    const manual = isoSet(manualBlocks)
    for (const d of pendingDates) manual.delete(d)
    for (const d of confirmedDates) manual.delete(d)
    return manual
  }, [manualBlocks, pendingDates, confirmedDates])

  const selectedHold = useMemo(() => {
    if (!checkIn || !checkOut) return null
    return (
      activeHolds.find((h) => h.checkIn === checkIn && h.checkOut === checkOut) ??
      null
    )
  }, [activeHolds, checkIn, checkOut])

  const selectionIsManualOnly = useMemo(() => {
    if (!checkIn || !checkOut) return false
    if (selectedHold) return false
    let d = parseLocalDate(checkIn)
    const end = parseLocalDate(checkOut)
    while (d < end) {
      if (!manualOnlyDates.has(toISODate(d))) return false
      d = addDays(d, 1)
    }
    return true
  }, [checkIn, checkOut, selectedHold, manualOnlyDates])

  const ranges = useMemo(() => {
    const startDate = checkIn ? parseLocalDate(checkIn) : new Date()
    const endDate = checkOut
      ? parseLocalDate(checkOut)
      : checkIn
        ? addDays(parseLocalDate(checkIn), STAY_NIGHTS)
        : startDate
    return [{ startDate, endDate, key: 'selection' }]
  }, [checkIn, checkOut])

  function getDayClass(date: Date): string {
    const iso = toISODate(startOfDay(date))
    if (pendingDates.has(iso)) return 'day-pending'
    if (confirmedDates.has(iso)) return 'day-confirmed'
    if (manualOnlyDates.has(iso)) return 'day-manual'
    return 'day-available'
  }

  function handleChange(rangesByKey: RangeKeyDict) {
    const { startDate, endDate } = rangesByKey.selection
    if (!startDate) return
    const start = startOfDay(startDate)
    syncToMonth(start)
    if (!endDate) {
      setCheckIn(toISODate(start))
      setCheckOut('')
      setLocalError(null)
      return
    }
    const { checkIn: cin, checkOut: cout } = normalizeStayRange(start, endDate)
    syncToMonth(cin)
    setCheckIn(toISODate(cin))
    setCheckOut(toISODate(cout))
    setLocalError(null)
  }

  async function run(
    action: string,
    extra?: Record<string, string | undefined>,
  ) {
    const needsRange =
      action !== 'confirm' && action !== 'release'
    if (needsRange && (!checkIn || !checkOut)) {
      setLocalError(t('admin.calendar.selectDates'))
      return
    }
    setBusy(true)
    setLocalError(null)
    const result = await onAction({
      action,
      ...(needsRange ? { checkIn, checkOut } : {}),
      ...extra,
    })
    setBusy(false)
    if (!result.ok) {
      setLocalError(result.error ?? t('admin.errors.action'))
      return
    }
    if (action === 'manualReserve') {
      setGuestName('')
      setGuestPhone('')
      setGuestEmail('')
      setAdminNote('')
    }
  }

  function handleManualReserve(e: FormEvent) {
    e.preventDefault()
    if (!guestName.trim()) {
      setLocalError(t('admin.calendar.nameRequired'))
      return
    }
    void run('manualReserve', {
      guestName: guestName.trim(),
      guestPhone: guestPhone.trim() || undefined,
      guestEmail: guestEmail.trim() || undefined,
      adminNote: adminNote.trim() || undefined,
    })
  }

  const nightCount =
    checkIn && checkOut
      ? getNightCount(parseLocalDate(checkIn), parseLocalDate(checkOut))
      : 0

  return (
    <div className="admin-calendar">
      <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-stone-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-green-100 ring-1 ring-green-700/30" />
          {t('calendar.available')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-amber-100 ring-1 ring-amber-700/40" />
          {t('admin.calendar.legendPending')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-red-100 ring-1 ring-red-800/30" />
          {t('admin.calendar.legendConfirmed')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-stone/30 ring-1 ring-stone/50" />
          {t('admin.calendar.legendBlocked')}
        </span>
      </div>

      <div
        className={`chale-calendar overflow-x-auto rounded-xl border border-sand bg-white p-3 sm:p-4 ${disabled ? 'pointer-events-none opacity-60' : ''}`}
      >
        <CalendarMonthNav
          labelAnchor={labelAnchor}
          months={months}
          canGoPrev={canGoPrev}
          canGoNext={canGoNext}
          onPrev={goPrevMonth}
          onNext={goNextMonth}
        />
        <DateRange
          key={calendarKey}
          ranges={ranges}
          onChange={handleChange}
          months={months}
          direction="horizontal"
          locale={dateLocale}
          shownDate={shownDate}
          onShownDateChange={handleShownDateChange}
          minDate={minDate}
          maxDate={maxDate}
          showMonthAndYearPickers={false}
          moveRangeOnFirstSelection={false}
          rangeColors={['#b85c38']}
          showDateDisplay={false}
          dayContentRenderer={(date) => (
            <span className={getDayClass(date)}>{date.getDate()}</span>
          )}
        />
      </div>

      {checkIn && checkOut && (
        <p className="mt-3 text-sm text-stone">
          <span className="font-medium text-olive">{t('calendar.checkIn')}</span>{' '}
          {format(parseLocalDate(checkIn), dateFormat, { locale: dateLocale })}
          {' · '}
          <span className="font-medium text-olive">{t('calendar.checkOut')}</span>{' '}
          {format(parseLocalDate(checkOut), dateFormat, { locale: dateLocale })}
          {' · '}
          {t(nightCount === 1 ? 'calendar.nightsOne' : 'calendar.nightsMany', {
            count: nightCount,
          })}
        </p>
      )}

      {localError && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {localError}
        </p>
      )}

      {selectedHold && (
        <div className="mt-4 rounded-xl border border-olive/25 bg-olive/5 p-4">
          <p className="font-semibold text-olive">{selectedHold.guestName}</p>
          <p className="text-sm text-stone-muted">
            {selectedHold.checkIn} → {selectedHold.checkOut}
            {selectedHold.source === 'admin' && (
              <span className="ml-2 rounded bg-stone/15 px-1.5 py-0.5 text-xs">
                {t('admin.calendar.manualTag')}
              </span>
            )}
            {selectedHold.status === 'pending' && (
              <span className="ml-2 text-amber-800">
                · {t('admin.calendar.pendingTag')}
              </span>
            )}
          </p>
          {selectedHold.adminNote && (
            <p className="mt-1 text-sm text-stone-muted">{selectedHold.adminNote}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedHold.status === 'pending' && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void run('confirm', { holdId: selectedHold.id })}
                className="rounded-full bg-olive px-4 py-2 text-sm font-semibold text-cream disabled:opacity-50"
              >
                {t('admin.confirmPayment')}
              </button>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={() => void run('release', { holdId: selectedHold.id })}
              className="rounded-full border border-stone/40 px-4 py-2 text-sm font-medium text-olive disabled:opacity-50"
            >
              {t('admin.releaseDates')}
            </button>
          </div>
        </div>
      )}

      {!selectedHold && checkIn && checkOut && (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void run('block')}
              className="rounded-full bg-stone px-4 py-2 text-sm font-semibold text-cream hover:bg-stone/90 disabled:opacity-50"
            >
              {t('admin.calendar.blockDates')}
            </button>
            {selectionIsManualOnly && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void run('unblock')}
                className="rounded-full border border-stone/40 px-4 py-2 text-sm font-medium text-olive disabled:opacity-50"
              >
                {t('admin.calendar.unblockDates')}
              </button>
            )}
          </div>

          <form
            onSubmit={handleManualReserve}
            className="rounded-xl border border-terracotta/25 bg-terracotta/5 p-4"
          >
            <p className="text-sm font-semibold text-olive">
              {t('admin.calendar.manualReserveTitle')}
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block text-sm sm:col-span-2">
                <span className="font-medium text-stone">{t('admin.calendar.guestName')}</span>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-sand bg-white px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-stone">{t('booking.phone')}</span>
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-sand bg-white px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-stone">{t('booking.email')}</span>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-sand bg-white px-3 py-2"
                />
              </label>
              <label className="block text-sm sm:col-span-2">
                <span className="font-medium text-stone">{t('admin.calendar.note')}</span>
                <input
                  type="text"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-sand bg-white px-3 py-2"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={busy}
              className="mt-4 rounded-full bg-terracotta px-5 py-2.5 text-sm font-semibold text-cream disabled:opacity-50"
            >
              {t('admin.calendar.manualReserveSubmit')}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
