import { InvalidAddressError } from 'viem'
import { getAddress, isAddress } from '../../evm.util'

const toUpperCase = (address: string): string => {
  const [, hash] = address.split('0x')

  return `0x${hash.toUpperCase()}`
}

describe('evm', () => {
  const checksumAddress = '0x36A407E27EfCB82f05d7d8f2455400E56caCCd7F'
  const address = checksumAddress.toLowerCase()

  describe('isAddress', () => {
    it('returns true for lower case address', () => {
      expect(isAddress(address)).toEqual(true)
    })

    it('returns true for checksum address', () => {
      expect(isAddress(checksumAddress)).toEqual(true)
    })

    it('returns true for upper case address', () => {
      expect(isAddress(toUpperCase(address))).toEqual(true)
    })

    it('returns false for invalid string', () => {
      expect(isAddress('0x')).toEqual(false)
      expect(isAddress('0x123')).toEqual(false)
      expect(isAddress('foo')).toEqual(false)
      expect(isAddress(address.toUpperCase())).toEqual(false)
    })

    it('returns false for undefined', () => {
      expect(isAddress(undefined)).toEqual(false)
    })

    it('requires 0x prefix', () => {
      expect(isAddress(address.slice(2))).toEqual(false)
    })
  })

  describe('getAddress', () => {
    it('returns address on the given format', async () => {
      expect(getAddress(address)).toEqual(address)
      expect(getAddress(checksumAddress)).toEqual(checksumAddress)
      expect(getAddress(toUpperCase(address))).toEqual(toUpperCase(address))
    })

    it('throws InvalidAddressError for invalid string', () => {
      expect(() => getAddress(address.toUpperCase())).toThrow(InvalidAddressError)
      expect(() => getAddress('0x')).toThrow(InvalidAddressError)
      expect(() => getAddress('0x123')).toThrow(InvalidAddressError)
      expect(() => getAddress('foo')).toThrow(InvalidAddressError)
    })

    describe('when checksum option is present', () => {
      it('returns checksum address', () => {
        expect(getAddress(address, { checksum: true })).toEqual(checksumAddress)
      })
    })

    describe('when chainId option is present', () => {
      it('returns checksum address for the given chain', () => {
        expect(getAddress(address, { chainId: 1 })).toEqual('0x36a407e27EfcB82f05D7d8f2455400e56caCCD7f')
        expect(getAddress(address, { chainId: 137 })).toEqual('0x36A407E27EfcB82F05D7D8F2455400E56cacCD7F')
      })
    })
  })
})
