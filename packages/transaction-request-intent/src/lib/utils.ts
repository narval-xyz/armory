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
  isAddress,
  toAccountId,
  toAssetId
} from '@narval/authz-shared'
import { SetOptional } from 'type-fest'
import { Address, fromHex, presignMessagePrefix } from 'viem'
import {
  AssetTypeAndUnknown,
  ContractCallInput,
  ContractInformation,
  ContractRegistry,
  ContractRegistryInput,
  Intents,
  MessageInput,
  Misc,
  NULL_METHOD_ID,
  NativeTransferInput,
  PERMIT2_DOMAIN,
  Slip44SupportedAddresses,
  SupportedChains,
  TransactionCategory,
  TransactionKey,
  TransactionRegistry,
  TransactionStatus,
  TypedData,
  WalletType
} from './domain'
import { DecoderError } from './error'
import { Permit, Permit2, SignMessage, SignTypedData } from './intent.types'
import { MethodsMapping, SUPPORTED_METHODS, SupportedMethodId } from './supported-methods'
import { assertLowerHexString, isAssetType, isPermit, isPermit2, isString, isSupportedMethodId } from './typeguards'

export const getMethodId = (data?: string): Hex => (data ? assertLowerHexString(data.slice(0, 10)) : NULL_METHOD_ID)

export const getCategory = (methodId: Hex, to?: Hex | null): TransactionCategory => {
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
  const key = buildContractKey(chainId, contractAddress as Address)
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
  if (address) {
    const key = buildContractKey(chainId, address)
    const value = contractRegistry?.get(key)
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

export const decodeTypedData = (typedData: TypedData): SignTypedData => ({
  type: Intents.SIGN_TYPED_DATA,
  domain: typedData.domain
})

export const decodeMessage = (message: MessageInput): SignMessage => {
  if (!message.payload.startsWith(presignMessagePrefix)) {
    throw new Error('Invalid message prefix')
  }
  return {
    type: Intents.SIGN_MESSAGE,
    message: message.payload.slice(presignMessagePrefix.length + 2)
  }
}

export const decodePermit = (typedData: TypedData): Permit | null => {
  const { chainId, verifyingContract } = typedData.domain
  if (!isPermit(typedData.message)) {
    return null
  }
  const { spender, value, deadline } = typedData.message
  return {
    type: Intents.PERMIT,
    amount: fromHex(value, 'bigint').toString(),
    spender: toAccountIdLowerCase({
      chainId,
      address: spender
    }),
    token: toAccountIdLowerCase({
      chainId,
      address: verifyingContract
    }),
    deadline: deadline
  }
}

export const decodePermit2 = (typedData: TypedData): Permit2 | null => {
  const { domain, message } = typedData
  if (domain.name !== PERMIT2_DOMAIN.name || domain.verifyingContract !== PERMIT2_DOMAIN.verifyingContract) {
    return null
  }
  if (!isPermit2(message)) {
    return null
  }
  return {
    type: Intents.PERMIT2,
    spender: toAccountIdLowerCase({
      chainId: domain.chainId,
      address: message.spender
    }),
    token: toAccountIdLowerCase({
      chainId: domain.chainId,
      address: message.details.token
    }),
    amount: fromHex(message.details.amount, 'bigint').toString(),
    deadline: message.details.expiration
  }
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
  const conditions = [
    {
      condition: () =>
        methodId === SupportedMethodId.TRANSFER_FROM &&
        ((toType && toType.assetType === AssetType.ERC20) || (toType && toType.assetType === AssetType.ERC721)),
      intent: toType?.assetType === AssetType.ERC721 ? Intents.TRANSFER_ERC721 : Intents.TRANSFER_ERC20
    },
    {
      condition: () => methodId === SupportedMethodId.NULL_METHOD_ID && to === from,
      intent: Intents.CANCEL_TRANSACTION
    },
    {
      condition: () => {
        return methodId === SupportedMethodId.CREATE_ACCOUNT && fromType && fromType.factoryType !== WalletType.UNKNOWN
      },
      intent:
        fromType && fromType.factoryType === WalletType.ERC4337
          ? Intents.DEPLOY_ERC_4337_WALLET
          : Intents.DEPLOY_SAFE_WALLET
    },
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

export const checkCancelTransaction = (input: NativeTransferInput): Intents => {
  const { from, to, value } = input
  if (from === to && (value === '0x0' || value === '0x')) {
    return Intents.CANCEL_TRANSACTION
  }
  return Intents.TRANSFER_NATIVE
}

export const nativeCaip19 = (chainId: number): AssetId => {
  if (chainId !== SupportedChains.ETHEREUM && chainId !== SupportedChains.POLYGON) {
    throw new DecoderError({
      message: 'Invalid chainId',
      status: 400,
      context: {
        chainId
      }
    })
  }
  const coinType = chainId === SupportedChains.ETHEREUM ? Slip44SupportedAddresses.ETH : Slip44SupportedAddresses.MATIC
  return toAssetId({
    chainId,
    assetType: AssetType.SLIP44,
    coinType
  })
}

export const getMethod = (methodId: SupportedMethodId, supportedMethods: MethodsMapping) => {
  const method = supportedMethods[methodId]
  if (!method) throw new Error('Unsupported methodId')
  return method
}
