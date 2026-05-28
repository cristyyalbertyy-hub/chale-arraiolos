export interface PaymentDetails {
  multibanco?: string
  mbway?: string
  iban?: string
  revolut?: string
}

const ENV_KEYS = {
  multibanco: ['PAYMENT_MULTIBANCO', 'payment_multibanco'],
  mbway: ['PAYMENT_MBWAY', 'payment_mbway'],
  iban: ['PAYMENT_IBAN', 'PAYMENT_NIB', 'payment_iban', 'payment_nib'],
  revolut: ['PAYMENT_REVOLUT', 'payment_revolut'],
} as const

function readEnv(names: readonly string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name]?.trim()
    if (value) return value
  }
  return undefined
}

export function getPaymentDetails(): PaymentDetails {
  return {
    multibanco: readEnv(ENV_KEYS.multibanco),
    mbway: readEnv(ENV_KEYS.mbway),
    iban: readEnv(ENV_KEYS.iban),
    revolut: readEnv(ENV_KEYS.revolut),
  }
}

export function hasPaymentDetails(config: PaymentDetails): boolean {
  return Boolean(
    config.multibanco || config.mbway || config.iban || config.revolut,
  )
}

export function formatPaymentReference(holdId: string): string {
  return `CHALE-${holdId.slice(0, 8).toUpperCase()}`
}
