import { Hex } from 'viem'
import { encodeEoaAccountId } from './caip'
import {
  AssetTypeEnum,
  ContractRegistry,
  Intents,
  NULL_METHOD_ID,
  TransactionCategory,
  TransactionRegistry,
  TransactionStatus,
  ValidatedInput
} from './domain'
import { SUPPORTED_METHODS, SupportedMethodId } from './supported-methods'
import { assertHexString, isSupportedMethodId } from './typeguards'

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

const contractTypeLookup = (
  txRequest: ValidatedInput,
  contractRegistry: ContractRegistry
): AssetTypeEnum | undefined => {
  if ('to' in txRequest && txRequest.to) {
    const key = encodeEoaAccountId({
      chainId: txRequest.chainId,
      evmAccountAddress: txRequest.to
    })
    return contractRegistry[key]
  }
  return undefined
}

export const transactionLookup = (
  txRequest: ValidatedInput,
  transactionRegistry?: TransactionRegistry
): TransactionStatus | undefined => {
  const account = encodeEoaAccountId({
    chainId: txRequest.chainId,
    evmAccountAddress: txRequest.from
  })
  const key = `${account}-${txRequest.nonce}`
  if (transactionRegistry) {
    return transactionRegistry[key]
  }
  return undefined
}

export const getTransactionIntentType = ({
  methodId,
  txRequest,
  contractRegistry,
  transactionRegistry
}: {
  methodId: Hex
  txRequest: ValidatedInput
  contractRegistry?: ContractRegistry
  transactionRegistry?: TransactionRegistry
}): Intents => {
  const trxStatus = transactionLookup(txRequest, transactionRegistry)
  if (trxStatus === TransactionStatus.PENDING) {
    return Intents.RETRY_TRANSACTION
  }
  if (trxStatus === TransactionStatus.FAILED) {
    return Intents.CANCEL_TRANSACTION
  }
  if (methodId === NULL_METHOD_ID) {
    return Intents.TRANSFER_NATIVE
  }
  if (methodId === SupportedMethodId.TRANSFER_FROM && contractRegistry) {
    const assetType = contractTypeLookup(txRequest, contractRegistry)
    if (assetType === AssetTypeEnum.ERC721) {
      return Intents.TRANSFER_ERC721
    }
    if (assetType === AssetTypeEnum.ERC20) {
      return Intents.TRANSFER_ERC20
    }
  }
  if (isSupportedMethodId(methodId) && SUPPORTED_METHODS[methodId].intent) {
    return SUPPORTED_METHODS[methodId].intent || Intents.CALL_CONTRACT
  }
  return Intents.CALL_CONTRACT
}
