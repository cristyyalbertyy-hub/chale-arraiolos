export interface Activity {
  id: string
  pricePerPerson: number
  /** Duração em horas; `null` = não mostrar duração */
  durationHours: number | null
  category: 'workshop' | 'meal'
  /**
   * perPerson — preço × pessoas (predefinido)
   * fixed — preço único; sem selector de pessoas
   * onRequest — valor a confirmar com a anfitriã (não entra no total estimado)
   */
  pricingMode?: 'perPerson' | 'fixed' | 'onRequest'
}

/** Actividade seleccionada com número de participantes */
export interface ActivitySelection {
  id: string
  people: number
}
