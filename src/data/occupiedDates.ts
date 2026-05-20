/** Converte 'YYYY-MM-DD' para Date à meia-noite (hora local). */
function parseLocalDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Dias já reservados (exemplo).
 * No futuro estes dados podem vir de uma API ou base de dados.
 */
export const occupiedDates: Date[] = [
  // Fim de semana de 6–8 junho 2026
  '2026-06-06',
  '2026-06-07',
  '2026-06-08',
  // Semana de São João
  '2026-06-23',
  '2026-06-24',
  '2026-06-25',
  '2026-06-26',
  '2026-06-27',
  '2026-06-28',
  // Agosto — época alta
  '2026-08-01',
  '2026-08-02',
  '2026-08-03',
  '2026-08-04',
  '2026-08-05',
  '2026-08-14',
  '2026-08-15',
  '2026-08-16',
  '2026-08-17',
  '2026-08-18',
  '2026-08-19',
  '2026-08-20',
  // Outubro
  '2026-10-10',
  '2026-10-11',
  '2026-10-12',
  // Natal / Ano Novo
  '2026-12-23',
  '2026-12-24',
  '2026-12-25',
  '2026-12-26',
  '2026-12-27',
  '2026-12-28',
  '2026-12-29',
  '2026-12-30',
  '2026-12-31',
  '2027-01-01',
  '2027-01-02',
].map(parseLocalDate)
