export const REDACT_KEYS = [
  /mnemonic/i,
  /privatekey/i,
  /passw(or)?d/i,
  /^pw$/i,
  /^pass$/i,
  /secret/i,
  /token/i,
  /api[-._]?key/i
]

export const REDACT_REPLACE = '[REDACTED]'
