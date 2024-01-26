import {
  Account,
  AccountId,
  Asset,
  AssetId,
  AssetType,
  Hex,
  Namespace,
  TransactionRequest,
  isAccountId,
  toAccountId,
  toAssetId
} from '@narval/authz-shared'
import { SetOptional } from 'type-fest'
import { Address, isAddress } from 'viem'
import {
  AssetTypeAndUnknown,
  ContractCallInput,
  ContractInformation,
  ContractRegistry,
  ContractRegistryInput,
  Intents,
  Misc,
  NULL_METHOD_ID,
  NativeTransferInput,
  TransactionCategory,
  TransactionKey,
  TransactionRegistry,
  TransactionStatus,
  WalletType
} from './domain'
import { SUPPORTED_METHODS, SupportedMethodId } from './supported-methods'
import { assertLowerHexString, isAssetType, isString, isSupportedMethodId } from './typeguards'

export const getMethodId = (data?: string): Hex => (data ? assertLowerHexString(data.slice(0, 10)) : NULL_METHOD_ID)

export const getCategory = (methodId: Hex, to?: Hex | null): TransactionCategory => {
  console.log('### getCategory', methodId, to)
  if (methodId === SupportedMethodId.NULL_METHOD_ID) {
    return TransactionCategory.NATIVE_TRANSFER
  }
  if (!to) {
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
}): { [key: AccountId]: AssetTypeAndUnknown } => {
  const registry: { [key: AccountId]: AssetTypeAndUnknown } = {}
  if (!isAddress(contractAddress) || !isAssetType(assetType)) {
    throw new Error('Invalid contract registry entry')
  }
  const key = buildContractKey(chainId, contractAddress)
  registry[key] = assetType
  return registry
}

export const buildContractRegistry = (input: ContractRegistryInput): ContractRegistry => {
  const registry = new Map()
  input.forEach(({ contract, assetType, factoryType }) => {
    const information = {
      assetType: assetType || Misc.UNKNOWN,
      factoryType: factoryType || WalletType.UNKNOWN
    }
    if (isString(contract)) {
      if (!isAccountId(contract)) {
        throw new Error(`Contract registry key is not a valid Caip10: ${contract}`)
      }
      registry.set(contract.toLowerCase(), information)
    } else {
      const key = buildContractKey(contract.chainId, contract.address)
      registry.set(key, information)
    }
  })
  return registry
}

export const buildContractKey = (
  chainId: number,
  contractAddress: Hex,
  namespace: Namespace = Namespace.EIP155
): AccountId => toAccountId({ namespace, chainId, address: contractAddress })

export const checkContractRegistry = (registry: Record<string, string>) => {
  Object.keys(registry).forEach((key) => {
    if (!isAccountId(key)) {
      throw new Error(`Invalid contract registry key: ${key}: ${registry[key]}`)
    }
    if (!isAssetType(registry[key])) {
      throw new Error(`Invalid contract registry value: ${key}: ${registry[key]}`)
    }
  })
  return true
}

export const contractTypeLookup = (
  chainId: number,
  address?: Address,
  contractRegistry?: ContractRegistry
): ContractInformation | undefined => {
  console.log('### contractTypeLookup', chainId, address, contractRegistry)
  if (address) {
    const key = buildContractKey(chainId, address)
    console.log('### key', key)
    const value = contractRegistry?.get(key)
    console.log('### value', value)
    return value
  }
  return undefined
}

export const buildTransactionKey = (txRequest: TransactionRequest): TransactionKey => {
  if (!txRequest.nonce) throw new Error('nonce needed to build transaction key')
  const account = toAccountId({
    chainId: txRequest.chainId,
    address: txRequest.from,
    namespace: Namespace.EIP155
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
  txRequest: ContractCallInput | NativeTransferInput
  contractRegistry?: ContractRegistry
}): Intents => {
  const { to, from, chainId } = txRequest
  const toType = contractTypeLookup(chainId, to, contractRegistry)
  const fromType = contractTypeLookup(chainId, from, contractRegistry)
  // !! ORDER MATTERS !!
  // Here we are checking for specific intents first.
  // Then we check for intents tight to specific methods
  // If nothing matches, we return the default Call Contract intent
  const conditions = [
    // Transfer From condition
    {
      condition: () =>
        methodId === SupportedMethodId.TRANSFER_FROM &&
        ((toType && toType.assetType === AssetType.ERC20) || (toType && toType.assetType === AssetType.ERC721)),
      intent: toType?.assetType === AssetType.ERC721 ? Intents.TRANSFER_ERC721 : Intents.TRANSFER_ERC20
    },
    // Cancel condition
    {
      condition: () => methodId === SupportedMethodId.NULL_METHOD_ID && to === from,
      intent: Intents.CANCEL_TRANSACTION
    },
    // Contract deployment conditions for specific transactions
    {
      condition: () => {
        console.log('condition 3', methodId, fromType, fromType?.factoryType !== WalletType.UNKNOWN)
        console.log('### fromtype.factoryType: ', fromType?.factoryType)
        console.log(methodId === SupportedMethodId.CREATE_ACCOUNT)
        console.log('methodId', methodId, SupportedMethodId.CREATE_ACCOUNT)
        return methodId === SupportedMethodId.CREATE_ACCOUNT && fromType && fromType.factoryType !== WalletType.UNKNOWN
      },
      intent:
        fromType && fromType.factoryType === WalletType.ERC4337
          ? Intents.DEPLOY_ERC_4337_WALLET
          : Intents.DEPLOY_SAFE_WALLET
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

export const getMasterContractAddress = (bytecode: Hex): string | null => {
  // Check for the common starting pattern of the minimal proxy contract
  const commonStart = '0x363d3d373d3d3d363d73'
  const commonEnd = '0x5af43d82803e903d91602b57fd5bf3'

  if (bytecode.startsWith(commonStart) && bytecode.endsWith(commonEnd)) {
    // Extract the address part
    const addressPart = bytecode.slice(commonStart.length, bytecode.length - commonEnd.length)

    // Pad the address part with zeros to the left if it's shorter than 40 characters
    const fullAddress = '0x' + addressPart.padStart(40, '0')
    return fullAddress
  }

  return null // Return null if the bytecode doesn't match the expected pattern
}

export const toAccountIdLowerCase = (input: SetOptional<Account, 'namespace'>): AccountId =>
  toAccountId(input).toLowerCase() as AccountId

export const toAssetIdLowerCase = (input: SetOptional<Asset, 'namespace'>): AssetId =>
  toAssetId(input).toLowerCase() as AssetId
