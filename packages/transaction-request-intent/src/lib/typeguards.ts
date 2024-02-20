// eslint-disable-next-line no-restricted-imports
import { AssetType, Hex } from '@narval/policy-engine-shared'
import { isAddress } from 'viem/utils'
import { AssetTypeAndUnknown, Misc, Permit2Message, PermitMessage } from './domain'
import { SupportedMethodId } from './supported-methods'

export const isSupportedMethodId = (value: Hex): value is SupportedMethodId => {
  return Object.values(SupportedMethodId).includes(value as SupportedMethodId)
}

export const isAssetType = (value: unknown): value is AssetTypeAndUnknown => {
  const types: AssetTypeAndUnknown[] = Object.values(AssetType)
  types.push(Misc.UNKNOWN)

  return types.includes(value as AssetTypeAndUnknown)
}

export const isPermit = (message: Record<string, unknown>): message is PermitMessage => {
  if (
    typeof message === 'object' &&
    'owner' in message &&
    'value' in message &&
    'nonce' in message &&
    'deadline' in message &&
    'spender' in message
  ) {
    return true
  }
  return false
}

export const isPermit2 = (message: Record<string, unknown>): message is Permit2Message => {
  if (typeof message !== 'object' || message === null || !('spender' in message) || !('details' in message)) {
    return false
  }
  const { spender, details } = message as { spender: unknown; details: unknown }
  if (
    typeof details === 'object' &&
    details !== null &&
    'amount' in details &&
    'nonce' in details &&
    'expiration' in details &&
    'token' in details &&
    'owner' in details
  ) {
    const { amount, nonce, expiration, token, owner } = details as {
      amount: unknown
      nonce: unknown
      expiration: unknown
      token: unknown
      owner: unknown
    }
    if (
      typeof amount === 'string' &&
      amount.startsWith('0x') &&
      typeof nonce === 'number' &&
      typeof expiration === 'number' &&
      typeof spender === 'string' &&
      typeof token === 'string' &&
      typeof owner === 'string' &&
      isAddress(token) &&
      isAddress(spender) &&
      isAddress(owner)
    ) {
      return true
    }
  }
  return false
}
