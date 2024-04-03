import { hash } from '../../hash'

describe('hashRequest', () => {
  it('hashes the given object', () => {
    expect(
      hash({
        a: 'a',
        b: 1,
        c: false
      })
    ).toEqual('0x7372a4267af39345919d5d26984da5e387d8d93b25283c9740b3bd43841bcf49')
  })

  it('hashes the given array', () => {
    expect(hash(['a', 1, false])).toEqual('0xcdd23dea0598c5ffc66b6a53f9dc7448a87b47454f209caa310e21da91754173')
  })

  it('hashes two objects deterministically', () => {
    const a = {
      a: 'a',
      b: 1,
      c: false,
      d: {
        a: 'a',
        b: 1
      }
    }
    const b = {
      c: false,
      b: 1,
      d: {
        b: 1,
        a: 'a'
      },
      a: 'a'
    }

    expect(hash(a)).toEqual(hash(b))
  })
})
