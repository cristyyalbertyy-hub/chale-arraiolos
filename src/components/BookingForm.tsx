import { useState, type FormEvent } from 'react'
import type { BookingFormData } from '../types/booking'

const FIELD_ERROR_INPUT =
  'border-terracotta bg-terracotta/5 ring-2 ring-terracotta/30 focus:border-terracotta focus:ring-terracotta/40'
const FIELD_OK_INPUT =
  'border-sand bg-white focus:border-olive focus:ring-2 focus:ring-olive/20'

function inputClass(hasError: boolean): string {
  return `mt-1.5 w-full rounded-xl border px-4 py-3 text-stone outline-none ${hasError ? FIELD_ERROR_INPUT : FIELD_OK_INPUT}`
}

function labelClass(hasError: boolean): string {
  return `block text-sm font-medium ${hasError ? 'text-terracotta' : 'text-stone'}`
}

function focusFirstInvalidField(next: Partial<Record<keyof BookingFormData, string>>) {
  if (next.checkIn || next.checkOut) {
    document.getElementById('booking-dates')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }
  const order: (keyof BookingFormData)[] = ['name', 'email', 'phone', 'adults', 'children']
  for (const field of order) {
    if (next[field]) {
      const el = document.getElementById(field)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      if (el instanceof HTMLInputElement) el.focus({ preventScroll: true })
      return
    }
  }
}
import { useTranslation } from 'react-i18next'
import { AvailabilityCalendar } from './AvailabilityCalendar'
import {
  formatCurrency,
  getBookingTotal,
  getStayLineLabelKey,
  MAX_PEOPLE,
} from '../lib/booking'
import { StayPricingSummary } from './StayPricingSummary'
import {
  getNightCount,
  parseLocalDate,
  rangeOverlapsOccupied,
} from '../lib/dates'
import {
  formatActivityLinePrice,
  formatActivitySelectionLabel,
  getActivityById,
  hidesPeopleSelector,
} from '../lib/activities'
import { BathroomNotice } from './BathroomNotice'
import { CancellationPolicyNotice } from './CancellationPolicy'
import { submitBooking } from '../lib/submitBooking'
import type { ActivitySelection } from '../types/activity'
import { useOccupiedDates } from '../hooks/useOccupiedDates'

interface BookingFormProps {
  activitySelections: ActivitySelection[]
  onReset: () => void
}

const initialForm: BookingFormData = {
  checkIn: '',
  checkOut: '',
  name: '',
  email: '',
  phone: '',
  adults: 2,
  children: 0,
}

export function BookingForm({ activitySelections, onReset }: BookingFormProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language.split('-')[0]
  const { occupiedDates, refresh: refreshOccupied } = useOccupiedDates()

  const [form, setForm] = useState<BookingFormData>(initialForm)
  const [submitted, setSubmitted] = useState(false)
  const [calendarKey, setCalendarKey] = useState(0)
  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDatesRequired, setShowDatesRequired] = useState(false)

  const pricing = getBookingTotal(
    form.checkIn,
    form.checkOut,
    activitySelections,
    form.adults,
    form.children,
  )
  const hasDates = Boolean(form.checkIn && form.checkOut)
  const datesRequiredMessage = t('booking.selectDatesRequired')

  function updateField<K extends keyof BookingFormData>(
    field: K,
    value: BookingFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
    setSubmitError(null)
  }

  function validate(): boolean {
    const next: Partial<Record<keyof BookingFormData, string>> = {}

    if (!form.checkIn || !form.checkOut) {
      next.checkIn = datesRequiredMessage
      next.checkOut = datesRequiredMessage
      setShowDatesRequired(true)
    }
    if (form.checkIn && form.checkOut) {
      const start = parseLocalDate(form.checkIn)
      const end = parseLocalDate(form.checkOut)
      const nights = getNightCount(start, end)
      if (nights < 1) {
        next.checkOut = t('booking.errors.minNights', { count: 1 })
      } else if (rangeOverlapsOccupied(start, end, occupiedDates)) {
        next.checkOut = t('booking.errors.occupied')
      }
    }
    if (!form.name.trim()) next.name = t('booking.errors.name')
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = t('booking.errors.email')
    }
    if (!form.phone.trim()) next.phone = t('booking.errors.phone')
    if (form.adults < 1) next.adults = t('booking.errors.adults')
    if (form.children < 0) next.children = t('booking.errors.children')
    if (pricing.people > MAX_PEOPLE) {
      next.adults = t('booking.errors.maxPeople', { max: MAX_PEOPLE })
    }
    const invalidActivity = activitySelections.find((s) => {
      const activity = getActivityById(s.id)
      if (activity && hidesPeopleSelector(activity)) return false
      return s.people < 1 || s.people > MAX_PEOPLE || s.people > pricing.people
    })
    if (invalidActivity) {
      next.adults =
        next.adults ??
        t('booking.errors.activityPeople', { max: pricing.people })
    }

    setErrors(next)
    if (Object.keys(next).length > 0) {
      focusFirstInvalidField(next)
    }
    return Object.keys(next).length === 0
  }

  function focusDatesSection() {
    document.getElementById('booking-dates')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!hasDates) {
      setShowDatesRequired(true)
      setErrors((prev) => ({
        ...prev,
        checkIn: datesRequiredMessage,
        checkOut: datesRequiredMessage,
      }))
      focusDatesSection()
      return
    }

    if (!validate()) return

    setIsSubmitting(true)
    setSubmitError(null)

    const result = await submitBooking({ form, activitySelections }, lang)

    setIsSubmitting(false)

    if (!result.ok) {
      setSubmitError(result.error)
      return
    }

    setSubmitted(true)
    void refreshOccupied()
  }

  function handleNewBooking() {
    setSubmitted(false)
    setForm(initialForm)
    setCalendarKey((k) => k + 1)
    setSubmitError(null)
    onReset()
  }

  if (submitted) {
    return (
      <section id="reservar" className="scroll-mt-20 bg-olive py-16 sm:py-24">
        <div className="mx-auto max-w-lg px-4 text-center sm:px-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cream/20 text-3xl">
            ✓
          </div>
          <h2 className="font-display mt-6 text-3xl font-semibold text-cream">
            {t('booking.successTitle')}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-sand">
            {t('booking.successMessage')}
          </p>
          <p className="mt-4 text-sm text-sand/80">
            {t('booking.successTotal')}{' '}
            <strong className="text-cream">
              {formatCurrency(pricing.total, lang)}
            </strong>
          </p>
          <button
            type="button"
            onClick={handleNewBooking}
            className="mt-8 rounded-full border border-cream/30 px-6 py-2.5 text-sm font-medium text-cream hover:bg-cream/10"
          >
            {t('booking.newBooking')}
          </button>
        </div>
      </section>
    )
  }

  return (
    <section id="reservar" className="scroll-mt-20 bg-olive py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-5 lg:gap-16">
          <div className="lg:col-span-2">
            <p className="text-sm font-semibold uppercase tracking-widest text-sand">
              {t('booking.eyebrow')}
            </p>
            <h2 className="font-display mt-2 text-3xl font-semibold text-cream sm:text-4xl">
              {t('booking.title')}
            </h2>
            <p className="mt-4 text-sand leading-relaxed">{t('booking.intro')}</p>
            <StayPricingSummary
              nights={hasDates ? pricing.nights : undefined}
              base={hasDates ? pricing.base : undefined}
              lang={lang}
            />
          </div>

          <form
            onSubmit={handleSubmit}
            className="lg:col-span-3 rounded-2xl bg-cream p-6 shadow-xl sm:p-8"
            noValidate
          >
            <BathroomNotice variant="booking" />

            <fieldset
              id="booking-dates"
              className={`mt-6 rounded-xl transition-colors ${
                errors.checkIn || errors.checkOut
                  ? 'ring-2 ring-terracotta/25 ring-offset-2 ring-offset-cream'
                  : ''
              }`}
            >
              <legend className="mb-3 block text-sm font-semibold text-olive">
                {t('booking.datesLegend')}
              </legend>

              <AvailabilityCalendar
                key={calendarKey}
                checkIn={form.checkIn}
                checkOut={form.checkOut}
                onRangeChange={(checkIn, checkOut) => {
                  setForm((prev) => ({ ...prev, checkIn, checkOut }))
                  setErrors((prev) => ({
                    ...prev,
                    checkIn: undefined,
                    checkOut: undefined,
                  }))
                  if (checkIn && checkOut) setShowDatesRequired(false)
                }}
                onOccupiedConflict={() => {
                  setErrors((prev) => ({
                    ...prev,
                    checkOut: t('booking.errors.occupiedPick'),
                  }))
                }}
              />

              {!hasDates && (
                <p
                  role="alert"
                  className={`mt-3 rounded-xl border px-4 py-3 text-sm font-medium leading-relaxed ${
                    showDatesRequired
                      ? 'border-terracotta/40 bg-terracotta/10 text-terracotta'
                      : 'border-olive/20 bg-sand/60 text-olive'
                  }`}
                >
                  {datesRequiredMessage}
                </p>
              )}

              {hasDates && (errors.checkIn || errors.checkOut) && (
                <p
                  role="alert"
                  className="mt-3 rounded-xl border border-terracotta/40 bg-terracotta/10 px-4 py-3 text-sm font-medium text-terracotta"
                >
                  {errors.checkIn ?? errors.checkOut}
                </p>
              )}
            </fieldset>

            <fieldset className="mt-8 grid gap-5 sm:grid-cols-2">
              <legend className="mb-1 text-sm font-semibold text-olive sm:col-span-2">
                {t('booking.yourDetails')}
              </legend>

              <div className="sm:col-span-2">
                <label htmlFor="name" className={labelClass(Boolean(errors.name))}>
                  {t('booking.name')}
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  aria-invalid={Boolean(errors.name)}
                  className={inputClass(Boolean(errors.name))}
                />
                {errors.name && (
                  <p role="alert" className="mt-1 text-sm font-medium text-terracotta">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className={labelClass(Boolean(errors.email))}>
                  {t('booking.email')}
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  className={inputClass(Boolean(errors.email))}
                />
                {errors.email && (
                  <p role="alert" className="mt-1 text-sm font-medium text-terracotta">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className={labelClass(Boolean(errors.phone))}>
                  {t('booking.phone')}
                </label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder={t('booking.phonePlaceholder')}
                  aria-invalid={Boolean(errors.phone)}
                  className={inputClass(Boolean(errors.phone))}
                />
                {errors.phone && (
                  <p role="alert" className="mt-1 text-sm font-medium text-terracotta">
                    {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="adults" className={labelClass(Boolean(errors.adults))}>
                  {t('booking.adults')}
                </label>
                <input
                  id="adults"
                  type="number"
                  min={1}
                  max={MAX_PEOPLE - form.children}
                  value={form.adults}
                  onChange={(e) =>
                    updateField('adults', Math.max(1, Number(e.target.value) || 1))
                  }
                  aria-invalid={Boolean(errors.adults)}
                  className={inputClass(Boolean(errors.adults))}
                />
                {errors.adults && (
                  <p role="alert" className="mt-1 text-sm font-medium text-terracotta">
                    {errors.adults}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="children" className={labelClass(Boolean(errors.children))}>
                  {t('booking.children')}
                </label>
                <input
                  id="children"
                  type="number"
                  min={0}
                  max={MAX_PEOPLE - form.adults}
                  value={form.children}
                  onChange={(e) =>
                    updateField('children', Math.max(0, Number(e.target.value) || 0))
                  }
                  aria-invalid={Boolean(errors.children)}
                  className={inputClass(Boolean(errors.children))}
                />
                {errors.children && (
                  <p role="alert" className="mt-1 text-sm font-medium text-terracotta">
                    {errors.children}
                  </p>
                )}
              </div>
            </fieldset>

            <div className="mt-6 rounded-xl border border-olive/20 bg-sand/40 px-4 py-4">
              <p className="text-sm font-semibold text-olive">{t('booking.estimatedTotal')}</p>
              <ul className="mt-3 space-y-2 text-sm text-stone">
                <li className="flex justify-between gap-2">
                  <span>
                    {t(getStayLineLabelKey(pricing.nights), { count: pricing.nights })}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(pricing.base, lang)}
                  </span>
                </li>
                {activitySelections.map((selection) => (
                  <li key={selection.id} className="flex justify-between gap-2">
                    <span className="min-w-0 pr-2">
                      {formatActivitySelectionLabel(selection, t)}
                    </span>
                    <span className="shrink-0 font-medium">
                      {formatActivityLinePrice(selection, t, lang)}
                    </span>
                  </li>
                ))}
                {activitySelections.length > 0 && (
                  <li className="flex justify-between gap-2 border-t border-sand/80 pt-2 text-stone-muted">
                    <span>{t('booking.activitiesSubtotal')}</span>
                    <span className="font-medium text-stone">
                      {formatCurrency(pricing.activities, lang)}
                    </span>
                  </li>
                )}
              </ul>
              <div className="mt-3 flex justify-between gap-2 border-t border-sand pt-3">
                <span className="font-semibold text-olive">{t('booking.total')}</span>
                <span className="font-display text-xl font-semibold text-olive">
                  {formatCurrency(pricing.total, lang)}
                </span>
              </div>
            </div>

            {submitError && (
              <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
                {submitError}
              </p>
            )}

            <div className="mt-6">
              <CancellationPolicyNotice variant="booking" />
            </div>

            <button
              type="submit"
              aria-disabled={!hasDates || isSubmitting}
              className={`mt-4 w-full rounded-full py-4 text-base font-semibold transition-colors sm:w-auto sm:px-10 ${
                !hasDates || isSubmitting
                  ? 'cursor-not-allowed bg-stone/25 text-stone-muted'
                  : 'bg-terracotta text-cream hover:bg-terracotta-dark'
              }`}
              disabled={!hasDates || isSubmitting}
            >
              {isSubmitting ? t('booking.submitting') : t('booking.submit')}
            </button>
            <p className="mt-3 text-center text-xs text-stone-muted sm:text-left">
              {t('booking.footnote')}
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
