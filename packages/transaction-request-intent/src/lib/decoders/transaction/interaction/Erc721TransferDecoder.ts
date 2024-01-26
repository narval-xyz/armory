import { AssetType } from '@narval/authz-shared'
import { AbiParameter } from 'viem'
import { ContractCallInput, Intents } from '../../../domain'
import { Erc721SafeTransferFromParams } from '../../../extraction/types'
import { TransferErc721 } from '../../../intent.types'
import { Erc721SafeTransferFromAbiParameters } from '../../../supported-methods'
import { isSupportedMethodId } from '../../../typeguards'
import { toAccountIdLowerCase, toAssetIdLowerCase } from '../../../utils'
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
        to: toAccountIdLowerCase({ chainId, address: to }),
        from: toAccountIdLowerCase({ chainId, address: from }),
        type: Intents.TRANSFER_ERC721,
        nftId: toAssetIdLowerCase({
          assetType: AssetType.ERC721,
          chainId,
          address: contract,
          assetId: tokenId.toString()
        }),
        contract: toAccountIdLowerCase({ chainId, address: contract })
      }
      return intent
    } catch (e) {
      throw new Error(`Params do not match ERC721 transfer methodId: ${e}`)
    }
  }
}
