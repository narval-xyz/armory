// eslint-disable-next-line no-restricted-imports
import { InvalidAddressError, getAddress as viemGetAddress, isAddress as viemIsAddress } from 'viem'
import { Address } from '../type/domain.type'

/**
 * Checks if a string is a valid Ethereum address without regard of its format.
 *
 * @param address - The string to be checked.
 * @returns Returns true if the string is a valid Ethereum address, otherwise
 * returns false.
 */
export const isAddress = (address?: string): boolean => {
  if (!address) {
    return false
  }

  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return false
  } else if (/^0x[0-9a-f]{40}$/.test(address) || /^0x[0-9A-F]{40}$/.test(address)) {
    return true
  } else {
    return viemIsAddress(address)
  }
}

/**
 * Retrieves the Ethereum address from a given string representation without
 * regard of its format.
 *
 * @param address - The string representation of the Ethereum address.
 * @param options - Optional parameters for address retrieval.
 * @param options.checksum - Specifies whether the retrieved address should be
 * checksummed.
 * @param options.chainId - The chain ID to be used for address retrieval.
 * @returns The Ethereum address.
 * @throws {InvalidAddressError} if the provided address is invalid.
 */
export const getAddress = (address: string, options?: { checksum?: boolean; chainId?: number }): Address => {
  if (isAddress(address)) {
    const validAddress = address as Address

    if (options?.checksum || options?.chainId) {
      return viemGetAddress(validAddress, options.chainId)
    }

    return validAddress
  }

  throw new InvalidAddressError({ address })
}
