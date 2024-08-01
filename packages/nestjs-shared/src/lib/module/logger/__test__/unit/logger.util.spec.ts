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

  it('does not mutate the given object', () => {
    const obj = {
      foo: [
        {
          secret: 'DO NOT MUTATE'
        },
        {
          password: 'DO NOT MUTATE'
        }
      ],
      bar: {
        baz: [
          {
            secret: 'DO NOT MUTATE'
          }
        ]
      }
    }

    redact(obj)

    expect(obj.foo[0].secret).toEqual('DO NOT MUTATE')
    expect(obj.foo[1].password).toEqual('DO NOT MUTATE')
    expect(obj.bar.baz[0].secret).toEqual('DO NOT MUTATE')
  })

  it('does not mutate the node when it extends Error', () => {
    class TestError extends Error {
      constructor(public config: { secret: string }) {
        super('TestClass')
      }
    }

    const obj = {
      foo: new TestError({
        secret: 'DO NOT MUTATE'
      })
    }

    redact(obj)

    expect(obj.foo.config.secret).toEqual('DO NOT MUTATE')
  })

  it('does not mutate the node when it is a class', () => {
    class TestClass {
      private secret: string
      public password: string

      constructor(input: { secret: string; password: string }) {
        this.secret = input.secret
        this.password = input.password
      }
    }

    const obj = {
      foo: new TestClass({
        secret: 'DO NOT MUTATE',
        password: 'DO NOT MUTATE'
      })
    }

    redact(obj)

    expect(obj.foo['secret']).toEqual('DO NOT MUTATE')
    expect(obj.foo.password).toEqual('DO NOT MUTATE')
  })
})
