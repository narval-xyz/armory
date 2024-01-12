import { AmbiguousAbi, Erc1155TransferAbi, Erc20TransferAbi, Erc721TransferAbi } from './abis'
import { AssetTypeEnum, Category, Intents, NULL_METHOD_ID, TransactionStatus } from './domain'
import { TransactionRequestIntentError } from './error'
import { TransactionRequest } from './transaction.type'
import { IntentRequest, TransactionRegistry } from './types'

const methodIdToAssetTypeMap: { [key: string]: AssetTypeEnum } = {
  ...Object.entries(Erc20TransferAbi).reduce((acc, [key]) => ({ ...acc, [key]: AssetTypeEnum.ERC20 }), {}),
  ...Object.entries(Erc721TransferAbi).reduce((acc, [key]) => ({ ...acc, [key]: AssetTypeEnum.ERC721 }), {}),
  ...Object.entries(Erc1155TransferAbi).reduce((acc, [key]) => ({ ...acc, [key]: AssetTypeEnum.ERC1155 }), {}),
  ...Object.entries(AmbiguousAbi).reduce((acc, [key]) => ({ ...acc, [key]: AssetTypeEnum.AMBIGUOUS_TRANSFER }), {})
}

export const getAssetType = (methodId: string, value?: string): AssetTypeEnum => {
  if (methodId === NULL_METHOD_ID && value) {
    return AssetTypeEnum.NATIVE
  }
  return methodIdToAssetTypeMap[methodId] || AssetTypeEnum.UNKNOWN
}

export const getTransactionManagementIntents = (firstTransaction: TransactionStatus) => {
  if (firstTransaction === TransactionStatus.FAILED) {
    return Intents.RETRY_TRANSACTION
  }
  return Intents.CANCEL_TRANSACTION
}

export const getContractLifecycleIntents = () => {}

export const getAuthorizationSignaturesIntents = () => {}

export const getTransferIntents = (assetType: AssetTypeEnum): Intents => {
  switch (assetType) {
    case AssetTypeEnum.ERC20:
      return Intents.TRANSFER_ERC20
    case AssetTypeEnum.ERC721:
      return Intents.TRANSFER_ERC721
    case AssetTypeEnum.ERC1155:
      return Intents.TRANSFER_ERC1155
    case AssetTypeEnum.NATIVE:
      return Intents.TRANSFER_NATIVE
    default:
      return Intents.CALL_CONTRACT
  }
}

export const getCategory = (
  assetType: AssetTypeEnum,
  methodId: string,
  to?: string | null,
  firstTransaction?: TransactionStatus
): Category => {
  if (firstTransaction) return Category.TRANSACTION_MANAGEMENT
  else if (!to) return Category.CONTRACT_LIFECYCLE
  else if (assetType !== AssetTypeEnum.UNKNOWN) return Category.TRANSFER
  else if (methodIdToAssetTypeMap[methodId] || methodId === NULL_METHOD_ID) return Category.AUTHORIZATION_SIGNATURES
  else return Category.GENERIC_CONTRACT_CALLS
}

export const getIntentType = (
  assetType: AssetTypeEnum,
  methodId: string,
  request: TransactionRequest,
  firstTransaction?: TransactionStatus
): Intents => {
  const category = getCategory(assetType, methodId, request.to, firstTransaction)
  switch (category) {
    case Category.TRANSFER:
      return getTransferIntents(assetType)
    // case Category.TRANSACTION_MANAGEMENT:
    //   return getTransactionManagementIntents(firstTransaction);
    // case Category.CONTRACT_LIFECYCLE:
    //   return getContractLifecycleIntents();
    // case Category.AUTHORIZATION_SIGNATURES:
    //   return getAuthorizationSignaturesIntents();
    default:
      return Intents.CALL_CONTRACT
  }
}

export const getMethodId = (data?: string): string => (data ? data.slice(0, 10) : NULL_METHOD_ID)

export const validateTransferIntent = (txRequest: TransactionRequest) => {
  const { data, to, chainId } = txRequest
  if (!data || !to || !chainId) {
    throw new TransactionRequestIntentError({
      message: 'Malformed transfer transaction request: missing data || chainId || to',
      status: 400,
      context: {
        chainId,
        data,
        to,
        txRequest
      }
    })
  }
  return { data, to, chainId }
}

export const validateNativeTransferIntent = (txRequest: TransactionRequest) => {
  const { value, chainId } = txRequest
  if (!value || !chainId) {
    throw new TransactionRequestIntentError({
      message: 'Malformed native transfer transaction request: missing value or chainId',
      status: 400,
      context: {
        value,
        chainId,
        txRequest
      }
    })
  }
  return { value, chainId }
}

export const validateIntent = (
  txRequest: TransactionRequest,
  transactionRegistry?: TransactionRegistry
): IntentRequest => {
  const { from, value, data, chainId, nonce } = txRequest
  if (!from || !chainId) {
    throw new TransactionRequestIntentError({
      message: 'Malformed transaction request: missing from OR chainId',
      status: 400,
      context: {
        txRequest
      }
    })
  }
  if (!value && !data) {
    throw new TransactionRequestIntentError({
      message: 'Malformed transaction request: missing value AND data',
      status: 400,
      context: {
        txRequest
      }
    })
  }

  const key = `${from}_${nonce}`
  const firstTransaction = transactionRegistry ? transactionRegistry[key] : undefined

  const methodId = getMethodId(data)
  const assetType = getAssetType(methodId, value)
  const type = getIntentType(assetType, methodId, txRequest, firstTransaction)

  switch (type) {
    case Intents.TRANSFER_ERC20 || Intents.TRANSFER_ERC721 || Intents.TRANSFER_ERC1155:
      return {
        type,
        assetType,
        methodId,
        validatedFields: validateTransferIntent(txRequest)
      }
    case Intents.TRANSFER_NATIVE:
      return {
        type,
        assetType,
        methodId,
        validatedFields: validateTransferIntent(txRequest)
      }
    default:
      throw new TransactionRequestIntentError({
        message: 'Unsupported intent',
        status: 400,
        context: {
          type,
          assetType,
          methodId,
          txRequest
        }
      })
  }
}
