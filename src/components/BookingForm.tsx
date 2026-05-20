import { useStripe } from '@stripe/react-stripe-js'
import { useState, type FormEvent } from 'react'
import type { BookingFormData } from '../types/booking'
import { AvailabilityCalendar } from './AvailabilityCalendar'
import {
  formatCurrency,
  getBookingTotal,
  MAX_PEOPLE,
  WEEKEND_BASE_PRICE,
} from '../lib/booking'
import { parseLocalDate, rangeOverlapsOccupied } from '../lib/dates'
import {
  formatActivitySelectionLabel,
  getActivityLineTotal,
} from '../lib/activities'
import { createCheckoutSession } from '../lib/stripe'
import type { ActivitySelection } from '../types/activity'
import { occupiedDates } from '../data/occupiedDates'

interface BookingFormProps {
  activitySelections: ActivitySelection[]
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

export function BookingForm({ activitySelections }: BookingFormProps) {
  const stripe = useStripe()
  const [form, setForm] = useState<BookingFormData>(initialForm)
  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({})
  const [payError, setPayError] = useState<string | null>(null)
  const [isPaying, setIsPaying] = useState(false)

  const pricing = getBookingTotal(activitySelections, form.adults, form.children)
  const hasDates = Boolean(form.checkIn && form.checkOut)
  const stripeConfigured = Boolean(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

  function updateField<K extends keyof BookingFormData>(
    field: K,
    value: BookingFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
    setPayError(null)
  }

  function validate(): boolean {
    const next: Partial<Record<keyof BookingFormData, string>> = {}

    if (!form.checkIn) next.checkIn = 'Selecione a data de entrada no calendário'
    if (!form.checkOut) next.checkOut = 'Selecione a data de saída no calendário'
    if (form.checkIn && form.checkOut) {
      const start = parseLocalDate(form.checkIn)
      const end = parseLocalDate(form.checkOut)
      if (rangeOverlapsOccupied(start, end, occupiedDates)) {
        next.checkOut = 'O intervalo inclui dias já reservados'
      }
    }
    if (!form.name.trim()) next.name = 'Indique o seu nome'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Indique um email válido'
    }
    if (!form.phone.trim()) next.phone = 'Indique o seu telemóvel'
    if (form.adults < 1) next.adults = 'Indique pelo menos 1 adulto'
    if (form.children < 0) next.children = 'Número de crianças inválido'
    if (pricing.people > MAX_PEOPLE) {
      next.adults = `Capacidade máxima: ${MAX_PEOPLE} pessoas (adultos + crianças)`
    }
    const invalidActivity = activitySelections.find(
      (s) => s.people < 1 || s.people > MAX_PEOPLE || s.people > pricing.people,
    )
    if (invalidActivity) {
      next.adults =
        next.adults ??
        `Cada actividade pode ter no máximo ${pricing.people} participante(s) (o total da reserva)`
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return

    if (!stripeConfigured) {
      setPayError(
        'Pagamento não configurado. Adicione VITE_STRIPE_PUBLISHABLE_KEY ao ficheiro .env.',
      )
      return
    }

    if (!stripe) {
      setPayError('A carregar o Stripe. Aguarde um momento e tente novamente.')
      return
    }

    setIsPaying(true)
    setPayError(null)

    const result = await createCheckoutSession({
      form,
      activitySelections,
    })

    if (result.error || !result.url) {
      setPayError(result.error ?? 'Não foi possível iniciar o pagamento.')
      setIsPaying(false)
      return
    }

    window.location.assign(result.url)
  }

  return (
    <section id="reservar" className="scroll-mt-20 bg-olive py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-5 lg:gap-16">
          <div className="lg:col-span-2">
            <p className="text-sm font-semibold uppercase tracking-widest text-sand">
              Reservar
            </p>
            <h2 className="font-display mt-2 text-3xl font-semibold text-cream sm:text-4xl">
              Planeie a sua estadia
            </h2>
            <p className="mt-4 text-sand leading-relaxed">
              Escolha as datas, preencha os seus dados e finalize o pagamento seguro com
              Stripe.
            </p>
            <div className="mt-8 rounded-2xl border border-cream/15 bg-cream/5 p-6">
              <p className="text-sm text-sand">Pacote fim-de-semana (casal)</p>
              <p className="font-display text-3xl font-semibold text-cream">
                {formatCurrency(WEEKEND_BASE_PRICE)}
              </p>
              <p className="mt-2 text-sm text-sand/80">
                + actividades (preço × pessoas por actividade)
              </p>
              <p className="mt-1 text-sm text-sand/80">
                Capacidade: até {MAX_PEOPLE} pessoas
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="lg:col-span-3 rounded-2xl bg-cream p-6 shadow-xl sm:p-8"
            noValidate
          >
            <fieldset>
              <legend className="mb-3 block text-sm font-semibold text-olive">
                Escolha as datas *
              </legend>

              <AvailabilityCalendar
                checkIn={form.checkIn}
                checkOut={form.checkOut}
                onRangeChange={(checkIn, checkOut) => {
                  setForm((prev) => ({ ...prev, checkIn, checkOut }))
                  setErrors((prev) => ({
                    ...prev,
                    checkIn: undefined,
                    checkOut: undefined,
                  }))
                }}
                onOccupiedConflict={() => {
                  setErrors((prev) => ({
                    ...prev,
                    checkOut: 'O intervalo inclui dias já reservados. Escolha outras datas.',
                  }))
                }}
              />

              {(errors.checkIn || errors.checkOut) && (
                <p className="mt-2 text-sm text-terracotta">
                  {errors.checkIn ?? errors.checkOut}
                </p>
              )}
            </fieldset>

            <fieldset className="mt-8 grid gap-5 sm:grid-cols-2">
              <legend className="mb-1 text-sm font-semibold text-olive sm:col-span-2">
                Os seus dados
              </legend>

              <div className="sm:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-stone">
                  Nome
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-3 text-stone outline-none focus:border-olive focus:ring-2 focus:ring-olive/20"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-terracotta">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-stone">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-3 text-stone outline-none focus:border-olive focus:ring-2 focus:ring-olive/20"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-terracotta">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-stone">
                  Telemóvel
                </label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+351 912 345 678"
                  className="mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-3 text-stone outline-none focus:border-olive focus:ring-2 focus:ring-olive/20"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-terracotta">{errors.phone}</p>
                )}
              </div>

              <div>
                <label htmlFor="adults" className="block text-sm font-medium text-stone">
                  Número de adultos
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
                  className="mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-3 text-stone outline-none focus:border-olive focus:ring-2 focus:ring-olive/20"
                />
                {errors.adults && (
                  <p className="mt-1 text-sm text-terracotta">{errors.adults}</p>
                )}
              </div>

              <div>
                <label htmlFor="children" className="block text-sm font-medium text-stone">
                  Número de crianças
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
                  className="mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-3 text-stone outline-none focus:border-olive focus:ring-2 focus:ring-olive/20"
                />
                {errors.children && (
                  <p className="mt-1 text-sm text-terracotta">{errors.children}</p>
                )}
              </div>
            </fieldset>

            <div className="mt-6 rounded-xl border border-olive/20 bg-sand/40 px-4 py-4">
              <p className="text-sm font-semibold text-olive">Total estimado</p>
              <ul className="mt-3 space-y-2 text-sm text-stone">
                <li className="flex justify-between gap-2">
                  <span>Base fim-de-semana (casal)</span>
                  <span className="font-medium">{formatCurrency(pricing.base)}</span>
                </li>
                {activitySelections.map((selection) => (
                  <li key={selection.id} className="flex justify-between gap-2">
                    <span className="min-w-0 pr-2">
                      {formatActivitySelectionLabel(selection)}
                    </span>
                    <span className="shrink-0 font-medium">
                      {formatCurrency(getActivityLineTotal(selection))}
                    </span>
                  </li>
                ))}
                {activitySelections.length > 0 && (
                  <li className="flex justify-between gap-2 border-t border-sand/80 pt-2 text-stone-muted">
                    <span>Subtotal actividades</span>
                    <span className="font-medium text-stone">
                      {formatCurrency(pricing.activities)}
                    </span>
                  </li>
                )}
              </ul>
              <div className="mt-3 flex justify-between gap-2 border-t border-sand pt-3">
                <span className="font-semibold text-olive">Total</span>
                <span className="font-display text-xl font-semibold text-olive">
                  {formatCurrency(pricing.total)}
                </span>
              </div>
              {!hasDates && (
                <p className="mt-2 text-xs text-stone-muted">
                  Selecione as datas no calendário para concluir a reserva.
                </p>
              )}
            </div>

            {payError && (
              <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
                {payError}
              </p>
            )}

            <button
              type="submit"
              className="mt-8 w-full rounded-full bg-terracotta py-4 text-base font-semibold text-cream transition-colors hover:bg-terracotta-dark disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-10"
              disabled={!hasDates || isPaying || (stripeConfigured && !stripe)}
            >
              {isPaying ? 'A redirecionar para o Stripe…' : 'Pagar com Stripe'}
            </button>
            <p className="mt-3 text-center text-xs text-stone-muted sm:text-left">
              * Datas obrigatórias. Pagamento seguro via Stripe Checkout.
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
