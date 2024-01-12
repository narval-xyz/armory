import { encodeEoaAccountId, encodeEoaAssetId } from './caip'
import { AssetTypeEnum, EipStandardEnum, Intents } from './domain'
import { TransactionRequestIntentError } from './error'
import { Intent, TransferErc20, TransferErc721 } from './intent.types'
import { extractErc20Amount, extractErc721AssetId } from './param-extractors'
import { IntentRequest } from './types'

export const decodeErc721 = ({
  data,
  methodId,
  chainId,
  assetType,
  to
}: {
  data: `0x${string}`
  methodId: string
  chainId: number
  assetType: AssetTypeEnum
  to: `0x${string}`
}) => {
  const intent: TransferErc721 = {
    type: Intents.TRANSFER_ERC721,
    nftId: encodeEoaAssetId({
      eipStandard: EipStandardEnum.EIP155,
      assetType,
      chainId,
      evmAccountAddress: to,
      tokenId: extractErc721AssetId(data, methodId)
    }),
    nftContract: encodeEoaAccountId({
      chainId,
      evmAccountAddress: to
    })
  }
  return intent
}

export const decodeErc20 = ({
  to,
  data,
  chainId,
  methodId
}: {
  to: `0x${string}`
  data: `0x${string}`
  chainId: number
  methodId: string
}): TransferErc20 => {
  const intent: TransferErc20 = {
    type: Intents.TRANSFER_ERC20,
    amount: extractErc20Amount(data, methodId),
    token: encodeEoaAccountId({
      chainId,
      evmAccountAddress: to
    })
  }

  return intent
}

export const decodeIntent = (request: IntentRequest): Intent => {
  const { methodId, type } = request

  switch (type) {
    case Intents.TRANSFER_ERC20:
      return decodeErc20({
        to: request.validatedFields.to,
        data: request.validatedFields.data,
        chainId: +request.validatedFields.chainId,
        methodId
      })
    case Intents.TRANSFER_ERC721:
      return decodeErc721({
        assetType: request.assetType,
        to: request.validatedFields.to,
        data: request.validatedFields.data,
        chainId: +request.validatedFields.chainId,
        methodId
      })
    default:
      throw new TransactionRequestIntentError({
        message: 'Unsupported intent',
        status: 400,
        context: {
          request
        }
      })
  }
}
