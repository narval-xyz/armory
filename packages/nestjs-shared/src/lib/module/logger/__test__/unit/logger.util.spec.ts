import { REDACT_REPLACE } from '../../logger.constant'
import { redact } from '../../logger.util'

const SENSITIVE_KEYS = ['mnemonic', 'privateKey', 'password', 'pass', 'pw', 'secret', 'token', 'apiKey', 'adminApiKey']

describe('redact', () => {
  const testRedaction = (key: string) =>
    it(`deep redacts ${key}`, () => {
      const obj = {
        [key]: 'senstive information',
        nested: {
          [key]: 'senstive information'
        },
        caseInsensitive: {
          upper: {
            [key.toUpperCase()]: 'senstive information'
          },
          lower: {
            [key.toLowerCase()]: 'senstive information'
          }
        },
        array: [{ [key]: 'senstive information' }]
      }

      expect(redact(obj)).toEqual({
        [key]: REDACT_REPLACE,
        nested: {
          [key]: REDACT_REPLACE
        },
        caseInsensitive: {
          upper: {
            [key.toUpperCase()]: REDACT_REPLACE
          },
          lower: {
            [key.toLowerCase()]: REDACT_REPLACE
          }
        },
        array: [{ [key]: REDACT_REPLACE }]
      })
    })

  SENSITIVE_KEYS.forEach(testRedaction)
})
