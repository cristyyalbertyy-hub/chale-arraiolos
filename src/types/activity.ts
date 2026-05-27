export interface Activity {
  id: string
  pricePerPerson: number
  /** Duração em horas; `null` = não mostrar duração */
  durationHours: number | null
  category: 'workshop' | 'meal'
  /** Preço único (ex.: passeio guiado); sem selector de pessoas */
  pricingMode?: 'perPerson' | 'fixed'
}

/** Actividade seleccionada com número de participantes */
export interface ActivitySelection {
  id: string
  people: number
}
