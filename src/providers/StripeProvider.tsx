import { Elements } from '@stripe/react-stripe-js'
import { loadStripe, type Stripe } from '@stripe/stripe-js'
import type { ReactNode } from 'react'

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

let stripePromise: Promise<Stripe | null> | null = null

export function getStripePromise(): Promise<Stripe | null> {
  if (!publishableKey) return Promise.resolve(null)
  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey)
  }
  return stripePromise
}

interface StripeProviderProps {
  children: ReactNode
}

export function StripeProvider({ children }: StripeProviderProps) {
  const stripe = getStripePromise()

  if (!publishableKey) {
    return <>{children}</>
  }

  return <Elements stripe={stripe}>{children}</Elements>
}
