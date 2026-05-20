export type AmenityItem = {
  icon: string
  label: string
  description: string
  href?: string
}

export const amenities: AmenityItem[] = [
  { icon: '🚿', label: 'Casa de banho no quintal · ~10 m', description: 'Sanitários no quintal, a cerca de 10 m do chalé (fora do alojamento)' },
  { icon: '🛏️', label: '1 quarto · 2 camas na sala', description: 'Um quarto e duas camas na sala de estar, com roupa de cama incluída' },
  { icon: '🍳', label: 'Cozinha equipada', description: 'Tudo o que precisa para preparar refeições' },
  { icon: '🔥', label: 'Fogueira no quintal', description: 'Noites acolhedoras ao ar livre no jardim' },
  { icon: '🌿', label: 'Jardim privado', description: 'Relva, sombra e churrasqueira' },
  { icon: '📶', label: 'Wi-Fi', description: 'Internet de banda larga em toda a casa' },
  { icon: '🅿️', label: 'Estacionamento', description: 'Lugar gratuito mesmo à porta' },
  { icon: '🏛️', label: 'Centro histórico', description: 'A 5 minutos a pé de Arraiolos' },
  {
    icon: '🎨',
    label: 'Actividades opcionais',
    description: 'Workshops, refeições e experiências — escolha quantas pessoas participam em cada uma',
    href: '#actividades',
  },
]
