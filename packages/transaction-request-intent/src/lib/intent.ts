import { AmbiguousAbi, Erc20TransferAbi, Erc721TransferAbi } from './abis'
import { decodeIntent } from './decoders'
import { AssetTypeEnum, Intents, NULL_METHOD_ID } from './domain'
import { TransactionRequestIntentError } from './error'
import { Intent } from './intent.types'
import { TransactionRequest } from './transaction.type'
import { Decode, IntentRequest } from './types'

const methodIdToAssetTypeMap: { [key: string]: AssetTypeEnum } = {
  ...Object.entries(Erc20TransferAbi).reduce((acc, [key]) => ({ ...acc, [key]: AssetTypeEnum.ERC20 }), {}),
  ...Object.entries(Erc721TransferAbi).reduce((acc, [key]) => ({ ...acc, [key]: AssetTypeEnum.ERC721 }), {}),
  ...Object.entries(AmbiguousAbi).reduce((acc, [key]) => ({ ...acc, [key]: AssetTypeEnum.AMBIGUOUS }), {})
}

export const determineType = (methodId: string, value?: string): AssetTypeEnum => {
  if (methodId === NULL_METHOD_ID && value) {
    return AssetTypeEnum.NATIVE
  }
  return methodIdToAssetTypeMap[methodId] || AssetTypeEnum.UNKNOWN
}

export const getIntentType = (assetType: AssetTypeEnum): Intents => {
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

export const validateIntent = (txRequest: TransactionRequest): IntentRequest => {
  const { from, value, data, chainId } = txRequest
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

  const methodId = getMethodId(data)
  const assetType = determineType(methodId, value)
  const type = getIntentType(assetType)

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

export const decode = (txRequest: TransactionRequest): Intent => {
  const request = validateIntent(txRequest)
  return decodeIntent(request)
}

export const safeDecode = (txRequest: TransactionRequest): Decode => {
  const request = validateIntent(txRequest)
  try {
    const intent = decodeIntent(request)
    return {
      success: true,
      intent
    }
  } catch (error) {
    if (error instanceof TransactionRequestIntentError) {
      return {
        success: false,
        error: {
          message: error.message,
          status: error.status,
          context: error.context || {}
        }
      }
    }
    return {
      success: false,
      error: {
        message: 'Unknown error',
        status: 500,
        context: {
          error
        }
      }
    }
  }
}
