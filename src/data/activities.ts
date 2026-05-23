import type { Activity } from '../types/activity'

/** Actividades criativas visíveis na reserva (ordem de apresentação) */
export const creativeActivityIds = [
  'pintura-acrilica',
  'aguarela',
  'bolachas-caseiras',
  'chocolate-dubai',
  'costura-criativa',
  'mosaico',
  'madeira',
  'bonecos-feltro',
  'conversa-passeio',
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
    id: 'conversa-passeio',
    pricePerPerson: 15,
    durationHours: 1.5,
    category: 'workshop',
  },
  {
    id: 'jantar-caseiro',
    pricePerPerson: 30,
    durationHours: null,
    category: 'meal',
  },
  {
    id: 'pequeno-almoco',
    pricePerPerson: 10,
    durationHours: null,
    category: 'meal',
  },
]

export const creativeActivities = creativeActivityIds
  .map((id) => activities.find((a) => a.id === id))
  .filter((a): a is Activity => a !== undefined)

export const mealActivities = activities.filter((a) => a.category === 'meal')
