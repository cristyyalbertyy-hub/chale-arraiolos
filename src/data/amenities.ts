export type AmenityItem = {
  icon: string
  id: string
  href?: string
}

export const amenities: AmenityItem[] = [
  { icon: '🚿', id: 'bathroom' },
  { icon: '🛏️', id: 'bedroom' },
  { icon: '🍳', id: 'kitchen' },
  { icon: '🔥', id: 'fire' },
  { icon: '🌿', id: 'garden' },
  { icon: '📶', id: 'wifi' },
  { icon: '🅿️', id: 'parking' },
  { icon: '🏛️', id: 'historic' },
  { icon: '🎨', id: 'activities', href: '#actividades' },
]
