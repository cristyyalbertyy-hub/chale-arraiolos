import type { ActivitySelection } from './types'

/** Preços por pessoa (sincronizar com src/data/activities.ts) */
const ACTIVITY_PRICES: Record<string, number> = {
  'pintura-acrilica': 25,
  aguarela: 25,
  'bolachas-caseiras': 20,
  'chocolate-dubai': 30,
  'costura-criativa': 25,
  mosaico: 30,
  madeira: 30,
  'bonecos-feltro': 25,
  'passeio-guiado': 20,
  'almoco': 25,
  lanche: 10,
  'ceia': 10,
  'jantar-caseiro': 25,
  'pequeno-almoco': 10,
}

const FIXED_PRICE_ACTIVITIES = new Set(['passeio-guiado'])

export function getActivityLineTotal(selection: ActivitySelection): number {
  const price = ACTIVITY_PRICES[selection.id]
  if (price === undefined) return 0
  if (FIXED_PRICE_ACTIVITIES.has(selection.id)) return price
  return price * selection.people
}

export function getActivitiesTotal(selections: ActivitySelection[]): number {
  return selections.reduce((sum, s) => sum + getActivityLineTotal(s), 0)
}
