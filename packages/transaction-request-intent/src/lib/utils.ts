import { TransactionRequest } from '@narval/authz-shared'
import { Hex, isAddress } from 'viem'
import { Caip10, encodeEoaAccountId } from './caip'
import {
  AssetTypeEnum,
  ContractRegistry,
  ContractRegistryInput,
  Intents,
  NULL_METHOD_ID,
  TransactionCategory,
  TransactionKey,
  TransactionRegistry,
  TransactionStatus,
  ValidatedInput
} from './domain'
import { SUPPORTED_METHODS, SupportedMethodId } from './supported-methods'
import { assertHexString, isAssetType, isCaip10, isSupportedMethodId } from './typeguards'

export const getMethodId = (data?: string): Hex => (data ? assertHexString(data.slice(0, 10)) : NULL_METHOD_ID)

export const getCategory = (methodId: Hex, to?: Hex | null): TransactionCategory => {
  if (methodId === SupportedMethodId.NULL_METHOD_ID) {
    return TransactionCategory.NATIVE_TRANSFER
  }
  if (to === null) {
    return TransactionCategory.CONTRACT_CREATION
  }
  return TransactionCategory.CONTRACT_INTERACTION
}

export const buildContractRegistryEntry = ({
  chainId,
  contractAddress,
  assetType
}: {
  chainId: number
  contractAddress: string
  assetType: string
}): { [key: Caip10]: AssetTypeEnum } => {
  const registry: { [key: Caip10]: AssetTypeEnum } = {}
  if (!isAddress(contractAddress) || !isAssetType(assetType)) {
    throw new Error('Invalid contract registry entry')
  }
  const key = buildContractKey(chainId, contractAddress)
  registry[key] = assetType
  return registry
}

export const buildContractRegistry = (input: ContractRegistryInput): ContractRegistry => {
  const registry = new Map()
  input.forEach(({ contract, assetType }) => {
    if (isCaip10(contract)) {
      registry.set(contract, assetType)
    } else {
      const key = buildContractKey(contract.chainId, contract.address)
      registry.set(key, assetType)
    }
  })
  return registry
}

export const buildContractKey = (chainId: number, contractAddress: Hex): Caip10 =>
  encodeEoaAccountId({ chainId, evmAccountAddress: contractAddress })

export const checkContractRegistry = (registry: Record<string, string>) => {
  Object.keys(registry).forEach((key) => {
    if (!isCaip10(key)) {
      throw new Error(`Invalid contract registry key: ${key}: ${registry[key]}`)
    }
    if (!isAssetType(registry[key])) {
      throw new Error(`Invalid contract registry value: ${key}: ${registry[key]}`)
    }
  })
  return true
}

export const contractTypeLookup = (
  txRequest: ValidatedInput,
  contractRegistry?: ContractRegistry
): AssetTypeEnum | undefined => {
  if ('to' in txRequest && txRequest.to && contractRegistry) {
    const key = buildContractKey(txRequest.chainId, txRequest.to)
    return contractRegistry.get(key)
  }
  return undefined
}

export const buildTransactionKey = (txRequest: TransactionRequest): TransactionKey => {
  const account = encodeEoaAccountId({
    chainId: txRequest.chainId,
    evmAccountAddress: txRequest.from
  })
  return `${account}-${txRequest.nonce}`
}

export type TransactionRegistryInput = {
  txRequest: TransactionRequest
  status: TransactionStatus
}[]

export const buildTransactionRegistry = (input: TransactionRegistryInput): TransactionRegistry => {
  const registry = new Map()
  input.forEach(({ txRequest, status }) => {
    const key = buildTransactionKey(txRequest)
    registry.set(key, status)
  })
  return registry
}

export const transactionLookup = (
  txRequest: TransactionRequest,
  transactionRegistry?: TransactionRegistry
): TransactionStatus | undefined => {
  const key: TransactionKey = buildTransactionKey(txRequest)
  console.log('\n\n', key, '\n\n', transactionRegistry, '\n\n')
  if (transactionRegistry) {
    return transactionRegistry.get(key)
  }
  return undefined
}

export const getTransactionIntentType = ({
  methodId,
  txRequest,
  contractRegistry
}: {
  methodId: Hex
  txRequest: ValidatedInput
  contractRegistry?: ContractRegistry
}): Intents => {
  const contractType = contractTypeLookup(txRequest, contractRegistry)

  // !! ORDER MATTERS !!
  // Here we are checking for specific intents first.
  // Then we check for intents tight to specific methods
  // If nothing matches, we return the default Call Contract intent
  const conditions = [
    // Transfer From condition
    {
      condition: () =>
        methodId === SupportedMethodId.TRANSFER_FROM &&
        contractType !== AssetTypeEnum.UNKNOWN &&
        contractType !== AssetTypeEnum.ERC1155 &&
        contractType !== AssetTypeEnum.NATIVE,
      intent: contractType === AssetTypeEnum.ERC721 ? Intents.TRANSFER_ERC721 : Intents.TRANSFER_ERC20
    },
    // Supported methods conditions
    {
      condition: () => true,
      intent: isSupportedMethodId(methodId) && SUPPORTED_METHODS[methodId].intent
    }
  ]
  const { intent } = conditions.find(({ condition }) => condition())!
  // default behavior: call contract
  return intent || Intents.CALL_CONTRACT
}
