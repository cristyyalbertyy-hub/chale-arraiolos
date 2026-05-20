/**
 * Configuração do Google Forms.
 *
 * 1. Cria o formulário em https://forms.google.com
 * 2. Publica e copia o link de envio (termina em /formResponse)
 * 3. Para obter os entry IDs: no formulário, "Obter link pré-preenchido",
 *    preenche um campo e copia da URL os parâmetros entry.XXXXX
 *
 * Exemplo de action URL:
 * https://docs.google.com/forms/d/e/1FAIpQLSd.../formResponse
 */
export const GOOGLE_FORM_ACTION_URL =
  import.meta.env.VITE_GOOGLE_FORM_ACTION_URL ?? ''

/** ID do campo (ex.: entry.123456789) — deixa vazio até configurares */
export const GOOGLE_FORM_ENTRIES = {
  resumo: import.meta.env.VITE_GOOGLE_FORM_ENTRY_RESUMO ?? '',
  nome: import.meta.env.VITE_GOOGLE_FORM_ENTRY_NOME ?? '',
  email: import.meta.env.VITE_GOOGLE_FORM_ENTRY_EMAIL ?? '',
  telefone: import.meta.env.VITE_GOOGLE_FORM_ENTRY_TELEFONE ?? '',
} as const

export function isGoogleFormConfigured(): boolean {
  return Boolean(GOOGLE_FORM_ACTION_URL && GOOGLE_FORM_ENTRIES.resumo)
}
