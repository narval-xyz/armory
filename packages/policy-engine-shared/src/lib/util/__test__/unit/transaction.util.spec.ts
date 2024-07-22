import { Hex } from '../../../type/domain.type'
import { getTxType } from '../../transaction.util'

describe('getTxType', () => {
  const baseTx = {
    chainId: 1,
    from: '0x123' as Hex,
    nonce: 1,
    data: '0x123' as Hex,
    to: '0x123' as Hex,
    value: '0x123' as Hex
  }
  it('returns "0" when tx.type is defined', () => {
    const tx = { ...baseTx, type: '0' as const }
    expect(getTxType(tx)).toBe('0')
  })

  it('returns "2" when maxFeePerGas is in tx', () => {
    const tx = { ...baseTx, maxFeePerGas: 100n }
    expect(getTxType(tx)).toBe('2')
  })

  it('returns "2" when maxPriorityFeePerGas is in tx', () => {
    const tx = { ...baseTx, maxPriorityFeePerGas: 50n }
    expect(getTxType(tx)).toBe('2')
  })

  it('returns "0" when gasPrice is in tx', () => {
    const tx = { ...baseTx, gasPrice: 10 }
    expect(getTxType(tx)).toBe('0')
  })

  it('returns "2" when gasPrice is in tx and maxFeePerGas is in tx', () => {
    const tx = { ...baseTx, gasPrice: 10, maxFeePerGas: 100n }
    expect(getTxType(tx)).toBe('2')
  })

  it('returns "undefined" when none of the specific properties are present', () => {
    const tx = { ...baseTx }
    expect(getTxType(tx)).toBe(undefined)
  })
})
