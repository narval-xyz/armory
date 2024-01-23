import { encodeEoaAccountId, encodeEoaAssetId } from '../../../caip'
import { AssetTypeEnum, ContractCallInput, EipStandardEnum, Intents } from '../../../domain'
import { Erc1155SafeTransferFromParams, SafeBatchTransferFromParams } from '../../../extraction/types'
import { ERC1155Transfer, TransferErc1155 } from '../../../intent.types'
import { SupportedMethodId } from '../../../supported-methods'
import { isSupportedMethodId } from '../../../typeguards'
import DecoderStrategy from '../../DecoderStrategy'

export default class ERC1155TransferDecoder extends DecoderStrategy {
  #input: ContractCallInput

  constructor(input: ContractCallInput) {
    super(input)
    this.#input = input
  }

  decode(): TransferErc1155 {
    const { to: contract, from, data, chainId, methodId } = this.#input
    if (!isSupportedMethodId(methodId)) {
      throw new Error('Unsupported methodId')
    }
    const params = this.extract(data, methodId)
    const transfers: ERC1155Transfer[] = []
    if (
      methodId === SupportedMethodId.SAFE_TRANSFER_FROM_1155 ||
      methodId === SupportedMethodId.SAFE_TRANSFER_FROM_WITH_BYTES_1155
    ) {
      const { to, tokenId, amount } = params as Erc1155SafeTransferFromParams
      transfers.push({
        tokenId: encodeEoaAssetId({
          eipStandard: EipStandardEnum.EIP155,
          assetType: AssetTypeEnum.ERC1155,
          chainId,
          evmAccountAddress: contract,
          tokenId: tokenId.toString()
        }),
        amount
      })
      const intent: TransferErc1155 = {
        to: encodeEoaAccountId({ chainId, evmAccountAddress: to }),
        from: encodeEoaAccountId({ chainId, evmAccountAddress: from }),
        type: Intents.TRANSFER_ERC1155,
        transfers,
        contract: encodeEoaAccountId({ chainId, evmAccountAddress: contract })
      }
      return intent
    } else if (methodId === SupportedMethodId.SAFE_BATCH_TRANSFER_FROM) {
      const { to, tokenIds, amounts } = params as SafeBatchTransferFromParams
      tokenIds.forEach((tokenId, index) => {
        transfers.push({
          tokenId: encodeEoaAssetId({
            eipStandard: EipStandardEnum.EIP155,
            assetType: AssetTypeEnum.ERC1155,
            chainId,
            evmAccountAddress: contract,
            tokenId: tokenId.toString()
          }),
          amount: amounts[index]
        })
      })
      const intent: TransferErc1155 = {
        to: encodeEoaAccountId({ chainId, evmAccountAddress: to }),
        from: encodeEoaAccountId({ chainId, evmAccountAddress: from }),
        type: Intents.TRANSFER_ERC1155,
        transfers,
        contract: encodeEoaAccountId({ chainId, evmAccountAddress: contract })
      }
      return intent
    }
    throw new Error('Params do not match ERC1155 transfer methodId')
  }
}
