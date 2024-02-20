import { stringify } from '../../json.util'

describe('json', () => {
  describe('stringify', () => {
    it('stringifies base primitives exactly like JSON.stringify', () => {
      const primitives = {
        string: 'example',
        number: 123,
        boolean: true,
        null: null,
        undefined: undefined,
        symbol: Symbol('example'),
        object: { key: 'value' },
        array: [1, 2, 3],
        nan: NaN,
        infinity: Infinity
      }

      expect(stringify(primitives)).toEqual(JSON.stringify(primitives))
    })

    it('stringifies bigint', () => {
      const bigint = {
        bigint: BigInt(5_000)
      }

      expect(stringify(bigint)).toEqual('{"bigint":"5000"}')
    })
  })
})
