import type { Activity } from '../types/activity'

/** Preço por pessoa — com selector de participantes */
export const perPersonActivityIds = [
  'pintura-acrilica',
  'aguarela',
  'bolachas-caseiras',
  'chocolate-dubai',
  'costura-criativa',
  'mosaico',
  'madeira',
  'bonecos-feltro',
  'tapete-arraiolos',
] as const

/** Preço por grupo — sem selector de pessoas */
export const groupActivityIds = [
  'passeio-guiado',
  'contador-historias',
  'momento-fado',
  'cantares-alentejanos',
] as const

export const activities: Activity[] = [
  {
    id: 'pintura-acrilica',
    pricePerPerson: 25,
    durationHours: 2,
    category: 'workshop',
  },
  {
    id: 'aguarela',
    pricePerPerson: 25,
    durationHours: 2,
    category: 'workshop',
  },
  {
    id: 'bolachas-caseiras',
    pricePerPerson: 20,
    durationHours: 1.5,
    category: 'workshop',
  },
  {
    id: 'chocolate-dubai',
    pricePerPerson: 30,
    durationHours: 2,
    category: 'workshop',
  },
  {
    id: 'costura-criativa',
    pricePerPerson: 25,
    durationHours: 2,
    category: 'workshop',
  },
  {
    id: 'mosaico',
    pricePerPerson: 30,
    durationHours: 2,
    category: 'workshop',
  },
  {
    id: 'madeira',
    pricePerPerson: 30,
    durationHours: 2,
    category: 'workshop',
  },
  {
    id: 'bonecos-feltro',
    pricePerPerson: 25,
    durationHours: 2,
    category: 'workshop',
  },
  {
    id: 'tapete-arraiolos',
    pricePerPerson: 20,
    durationHours: 2,
    category: 'workshop',
  },
  {
    id: 'passeio-guiado',
    pricePerPerson: 20,
    durationHours: null,
    category: 'workshop',
    pricingMode: 'group',
  },
  {
    id: 'contador-historias',
    pricePerPerson: 20,
    durationHours: null,
    category: 'workshop',
    pricingMode: 'group',
  },
  {
    id: 'momento-fado',
    pricePerPerson: 0,
    durationHours: null,
    category: 'workshop',
    pricingMode: 'onRequest',
  },
  {
    id: 'cantares-alentejanos',
    pricePerPerson: 0,
    durationHours: null,
    category: 'workshop',
    pricingMode: 'onRequest',
  },
  {
    id: 'pequeno-almoco',
    pricePerPerson: 10,
    durationHours: null,
    category: 'meal',
  },
  {
    id: 'almoco',
    pricePerPerson: 25,
    durationHours: null,
    category: 'meal',
  },
  {
    id: 'lanche',
    pricePerPerson: 10,
    durationHours: null,
    category: 'meal',
  },
  {
    id: 'jantar-caseiro',
    pricePerPerson: 25,
    durationHours: null,
    category: 'meal',
  },
  {
    id: 'ceia',
    pricePerPerson: 10,
    durationHours: null,
    category: 'meal',
  },
]

export const perPersonActivities = perPersonActivityIds
  .map((id) => activities.find((a) => a.id === id))
  .filter((a): a is Activity => a !== undefined)

export const groupActivities = groupActivityIds
  .map((id) => activities.find((a) => a.id === id))
  .filter((a): a is Activity => a !== undefined)

/** @deprecated use perPersonActivities */
export const creativeActivities = perPersonActivities

export const mealActivities = activities.filter((a) => a.category === 'meal')
