import { AbiParameter } from 'viem'
import { encodeEoaAccountId, encodeEoaAssetId } from '../../../caip'
import { AssetTypeEnum, ContractCallInput, EipStandardEnum, Intents } from '../../../domain'
import { Erc721SafeTransferFromParams } from '../../../extraction/types'
import { TransferErc721 } from '../../../intent.types'
import { Erc721SafeTransferFromAbiParameters } from '../../../supported-methods'
import { isSupportedMethodId } from '../../../typeguards'
import DecoderStrategy from '../../DecoderStrategy'

export default class Erc721TransferDecoder extends DecoderStrategy {
  abi: AbiParameter[] = Erc721SafeTransferFromAbiParameters
  input: ContractCallInput

  constructor(input: ContractCallInput) {
    super(input)
    this.input = input
  }

  decode(): TransferErc721 {
    try {
      const { to: contract, from, chainId, data, methodId } = this.input
      if (!isSupportedMethodId(methodId)) {
        throw new Error('Unsupported methodId')
      }
      const params = this.extract(data, methodId) as Erc721SafeTransferFromParams
      const { to, tokenId } = params
      const intent: TransferErc721 = {
        to: encodeEoaAccountId({ chainId, evmAccountAddress: to }),
        from: encodeEoaAccountId({ chainId, evmAccountAddress: from }),
        type: Intents.TRANSFER_ERC721,
        nftId: encodeEoaAssetId({
          eipStandard: EipStandardEnum.EIP155,
          assetType: AssetTypeEnum.ERC721,
          chainId,
          evmAccountAddress: contract,
          tokenId: tokenId.toString()
        }),
        contract: encodeEoaAccountId({ chainId, evmAccountAddress: contract })
      }
      return intent
    } catch (e) {
      throw new Error(`Params do not match ERC721 transfer methodId: ${e}`)
    }
  }
}
