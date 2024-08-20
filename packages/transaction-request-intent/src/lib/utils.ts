import {
  Asset,
  AssetId,
  AssetType,
  ChainAccount,
  ChainAccountId,
  Eip712TypedData,
  Hex,
  Namespace,
  assertHexString,
  toAssetId,
  toChainAccountId
} from '@narval/policy-engine-shared'
import { SetOptional } from 'type-fest'
import { Address, fromHex, presignMessagePrefix } from 'viem'
import {
  ContractCallInput,
  Intents,
  MessageInput,
  NULL_METHOD_ID,
  NativeTransferInput,
  PERMIT2_DOMAIN,
  TransactionCategory,
  WalletType
} from './domain'
import { DecoderError } from './error'
import { Permit, Permit2, SignMessage, SignTypedData } from './intent.types'
import { ChainId, ChainRegistry } from './registry/chain-registry'
import { ContractInformation, ContractRegistry } from './registry/contract-registry'
import { MethodsMapping, SUPPORTED_METHODS, SupportedMethodId } from './supported-methods'
import { isPermit, isPermit2, isSupportedMethodId } from './typeguards'

export const getMethodId = (data?: string): Hex => {
  if (!data || data === '0x') {
    return NULL_METHOD_ID
  }

  const assertData = assertHexString(data.slice(0, 10))

  if (!assertData) {
    throw new DecoderError({ message: 'Invalid data', status: 400 })
  }

  return assertData
}

export const getCategory = (methodId: Hex, to?: Hex | null, value?: Hex | null): TransactionCategory => {
  if (methodId === SupportedMethodId.NULL_METHOD_ID && value) {
    return TransactionCategory.NATIVE_TRANSFER
  }
  if (!to) {
    return TransactionCategory.CONTRACT_CREATION
  }
  return TransactionCategory.CONTRACT_INTERACTION
}

export const buildContractKey = (
  chainId: number,
  contractAddress: Hex,
  namespace: Namespace = Namespace.EIP155
): ChainAccountId => toChainAccountId({ namespace, chainId, address: contractAddress })

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

export const decodeTypedData = (typedData: Eip712TypedData): SignTypedData => ({
  type: Intents.SIGN_TYPED_DATA,
  typedData: Eip712TypedData.parse({
    ...typedData,
    domain: {
      ...typedData.domain,
      verifyingContract: typedData.domain.verifyingContract?.toLowerCase()
    }
  })
})

export const decodeMessage = (message: MessageInput): SignMessage => {
  if (!message.payload.startsWith(presignMessagePrefix)) {
    throw new DecoderError({ message: 'Invalid message prefix', status: 400 })
  }
  return {
    type: Intents.SIGN_MESSAGE,
    message: message.payload.slice(presignMessagePrefix.length + 2)
  }
}

export const decodePermit = (typedData: Eip712TypedData): Permit | null => {
  const { chainId, verifyingContract } = typedData.domain
  if (!isPermit(typedData.message) || !chainId || !verifyingContract) {
    return null
  }
  const { spender, value, deadline, owner } = typedData.message
  return {
    type: Intents.PERMIT,
    amount: fromHex(value, 'bigint').toString(),
    owner: toChainAccountIdLowerCase({
      chainId,
      address: owner
    }),
    spender: toChainAccountIdLowerCase({
      chainId,
      address: spender
    }),
    token: toChainAccountIdLowerCase({
      chainId,
      address: verifyingContract
    }),
    deadline: deadline
  }
}

export const decodePermit2 = (typedData: Eip712TypedData): Permit2 | null => {
  const { domain, message } = typedData
  if (domain.name !== PERMIT2_DOMAIN.name || domain.verifyingContract !== PERMIT2_DOMAIN.verifyingContract) {
    return null
  }
  if (!isPermit2(message) || !domain.chainId || !domain.verifyingContract) {
    return null
  }
  return {
    type: Intents.PERMIT2,
    owner: toChainAccountIdLowerCase({
      chainId: domain.chainId,
      address: message.details.owner
    }),
    spender: toChainAccountIdLowerCase({
      chainId: domain.chainId,
      address: message.spender
    }),
    token: toChainAccountIdLowerCase({
      chainId: domain.chainId,
      address: message.details.token
    }),
    amount: fromHex(message.details.amount, 'bigint').toString(),
    deadline: message.details.expiration
  }
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

export const toChainAccountIdLowerCase = (input: SetOptional<ChainAccount, 'namespace'>): ChainAccountId =>
  toChainAccountId(input).toLowerCase() as ChainAccountId

export const toAssetIdLowerCase = (input: SetOptional<Asset, 'namespace'>): AssetId =>
  toAssetId(input).toLowerCase() as AssetId

export const checkCancelTransaction = (input: NativeTransferInput): Intents => {
  const { from, to, value } = input
  if (from === to && (value === '0x0' || value === '0x')) {
    return Intents.CANCEL_TRANSACTION
  }
  return Intents.TRANSFER_NATIVE
}

export const nativeCaip19 = (chainId: ChainId, registry: ChainRegistry): AssetId => {
  const chain = registry.get(chainId)
  if (chain?.nativeSlip44 !== undefined) {
    return toAssetId({
      chainId,
      assetType: AssetType.SLIP44,
      namespace: Namespace.EIP155,
      coinType: chain.nativeSlip44
    })
  }
  throw new DecoderError({ message: 'Chain not supported', status: 400 })
}

export const getMethod = (methodId: SupportedMethodId, supportedMethods: MethodsMapping) => {
  const method = supportedMethods[methodId]
  if (!method) {
    throw new DecoderError({ message: 'Unsupported methodId', status: 400 })
  }
  return method
}
