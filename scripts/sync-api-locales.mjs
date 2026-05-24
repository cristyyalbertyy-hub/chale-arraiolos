import { cpSync } from 'node:fs'

cpSync('src/i18n/locales', 'api/locales', { recursive: true, force: true })
console.log('Synced src/i18n/locales → api/locales')
