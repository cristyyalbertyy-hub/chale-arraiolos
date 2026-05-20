export interface Activity {
  id: string
  name: string
  pricePerPerson: number
  /** Duração em horas; `null` para refeições sem duração fixa */
  durationHours: number | null
  category: 'workshop' | 'meal'
}

/** Actividade seleccionada com número de participantes */
export interface ActivitySelection {
  id: string
  people: number
}
