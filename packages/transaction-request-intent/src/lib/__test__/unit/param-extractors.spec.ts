import { extractErc20TransferAmount } from '../../param-extractors'

const invalidData = '0xInvalidData'
const validData =
  '0xa9059cbb000000000000000000000000031d8c0ca142921c459bcb28104c0ff37928f9ed000000000000000000000000000000000000000000005ab7f55035d1e7b4fe6d'

describe('extractErc20TransferAmount', () => {
  it('throws on incorrect data', () => {
    expect(() => extractErc20TransferAmount(invalidData)).toThrow('Malformed transaction request')
  })

  // TODO (@Pierre): Check if the test or implementation are correct.
  it('successfully extract amount on valid data', () => {
    expect(extractErc20TransferAmount(validData)).toEqual(
      '54802253485514079331440257873334643289895370523631496173467651529125391250897'
    )
  })
})
