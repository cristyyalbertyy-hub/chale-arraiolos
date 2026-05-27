import type { ActivitySelection } from './types'

/** Preços (sincronizar com src/data/activities.ts) */
const ACTIVITY_PRICES: Record<string, number> = {
  'pintura-acrilica': 25,
  aguarela: 25,
  'bolachas-caseiras': 20,
  'chocolate-dubai': 30,
  'costura-criativa': 25,
  mosaico: 30,
  madeira: 30,
  'bonecos-feltro': 25,
  'tapete-arraiolos': 20,
  'passeio-guiado': 20,
  'contador-historias': 20,
  almoco: 25,
  lanche: 10,
  ceia: 10,
  'jantar-caseiro': 25,
  'pequeno-almoco': 10,
}

const GROUP_PRICE_ACTIVITIES = new Set([
  'passeio-guiado',
  'contador-historias',
  'momento-fado',
  'cantares-alentejanos',
])

const ON_REQUEST_ACTIVITIES = new Set(['momento-fado', 'cantares-alentejanos'])

export function isPriceOnRequest(id: string): boolean {
  return ON_REQUEST_ACTIVITIES.has(id)
}

export function isGroupPrice(id: string): boolean {
  return GROUP_PRICE_ACTIVITIES.has(id) && !isPriceOnRequest(id)
}

export function getActivityLineTotal(selection: ActivitySelection): number {
  if (isPriceOnRequest(selection.id)) return 0
  const price = ACTIVITY_PRICES[selection.id]
  if (price === undefined) return 0
  if (isGroupPrice(selection.id)) return price
  return price * selection.people
}

export function getActivitiesTotal(selections: ActivitySelection[]): number {
  return selections.reduce((sum, s) => sum + getActivityLineTotal(s), 0)
}
