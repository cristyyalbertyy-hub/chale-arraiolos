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
    name: '🎨 Pintura acrílica – solte a criatividade com vista para o castelo',
    pricePerPerson: 25,
    durationHours: 2,
    category: 'workshop',
  },
  {
    id: 'aguarela',
    name: '🖌️ Aguarela – pinceladas leves, cores que respiram com o Alentejo',
    pricePerPerson: 25,
    durationHours: 2,
    category: 'workshop',
  },
  {
    id: 'bolachas-caseiras',
    name: '🍪 Bolachas caseiras – a receita da minha avó',
    pricePerPerson: 20,
    durationHours: 1.5,
    category: 'workshop',
  },
  {
    id: 'chocolate-dubai',
    name: '🍫 Chocolate do Dubai – a tendência viral, agora no Alentejo',
    pricePerPerson: 30,
    durationHours: 2,
    category: 'workshop',
  },
  {
    id: 'costura-criativa',
    name: '🧵 Costura criativa – aprenda ou recorde',
    pricePerPerson: 25,
    durationHours: 2,
    category: 'workshop',
  },
  {
    id: 'mosaico',
    name: '🧩 Mosaico – peças, cor e paciência; leve a sua obra para casa',
    pricePerPerson: 30,
    durationHours: 2,
    category: 'workshop',
  },
  {
    id: 'madeira',
    name: '🪵 Madeira – pequenas construções com ferramentas manuais',
    pricePerPerson: 30,
    durationHours: 2,
    category: 'workshop',
  },
  {
    id: 'bonecos-feltro',
    name: '🧸 Bonecos de feltro – para levar uma memória na mala',
    pricePerPerson: 25,
    durationHours: 2,
    category: 'workshop',
  },
  {
    id: 'conversa-passeio',
    name: '☕ Conversa ou passeio – ao seu ritmo, sem pressa',
    pricePerPerson: 15,
    durationHours: 1.5,
    category: 'workshop',
  },
  {
    id: 'introducao-ai',
    name: '🤖 Introdução à IA – ferramentas simples, sem jargão, ao seu ritmo',
    pricePerPerson: 25,
    durationHours: 2,
    category: 'workshop',
  },
  {
    id: 'ai-no-seu-melhor',
    name: '✨ IA no seu melhor – imagens, textos e ideias criativas na prática',
    pricePerPerson: 25,
    durationHours: 2,
    category: 'workshop',
  },
  {
    id: 'animacao',
    name: '🎬 Animação – dê vida a personagens, passo a passo',
    pricePerPerson: 25,
    durationHours: 2,
    category: 'workshop',
  },
  {
    id: 'vitrais',
    name: '🪟 Vitrais – luz e cor numa peça só sua',
    pricePerPerson: 30,
    durationHours: 2,
    category: 'workshop',
  },
  {
    id: 'tapete-arraiolos',
    name: '🪡 Tapete de Arraiolos – o ponto tradicional da vila, à sua mão',
    pricePerPerson: 30,
    durationHours: 2,
    category: 'workshop',
  },
  {
    id: 'jantar-caseiro',
    name: '🍷 Jantar caseiro – cozinhado por mim, com vinho da região',
    pricePerPerson: 30,
    durationHours: null,
    category: 'meal',
  },
  {
    id: 'pequeno-almoco',
    name: '🥐 Pequeno‑almoço alentejano – pão quente, queijo, azeitonas',
    pricePerPerson: 10,
    durationHours: null,
    category: 'meal',
  },
  {
    id: 'patamar-miradouro-casa-arvore',
    name: '🌳 Patamar miradouro · casa de árvore – vista do castelo, momento só seu',
    pricePerPerson: 0,
    durationHours: null,
    category: 'workshop',
  },
]

export const creativeActivities = creativeActivityIds
  .map((id) => activities.find((a) => a.id === id))
  .filter((a): a is Activity => a !== undefined)

export const mealActivities = activities.filter((a) => a.category === 'meal')
