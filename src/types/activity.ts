export interface Activity {
  id: string
  pricePerPerson: number
  /** Duração em horas; `null` = não mostrar duração */
  durationHours: number | null
  category: 'workshop' | 'meal'
  /**
   * perPerson — preço × pessoas (predefinido)
   * group — preço único para o grupo; sem selector de pessoas
   * onRequest — valor a confirmar (preço por grupo; não entra no total estimado)
   */
  pricingMode?: 'perPerson' | 'group' | 'onRequest'
}

/** Actividade seleccionada com número de participantes */
export interface ActivitySelection {
  id: string
  people: number
}
