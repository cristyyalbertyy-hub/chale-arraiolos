/** Centro histórico de Arraiolos (castelo e zona envolvente) */
export const ARRAIOLOS_CENTER = {
  lat: 38.7236,
  lng: -7.9865,
} as const

/** Mapa incorporado (sem API key) */
export const GOOGLE_MAPS_EMBED_URL = `https://www.google.com/maps?q=${ARRAIOLOS_CENTER.lat},${ARRAIOLOS_CENTER.lng}&hl=pt&z=15&output=embed`

/** Abrir no Google Maps */
export const GOOGLE_MAPS_OPEN_URL = `https://www.google.com/maps/search/?api=1&query=${ARRAIOLOS_CENTER.lat},${ARRAIOLOS_CENTER.lng}`
