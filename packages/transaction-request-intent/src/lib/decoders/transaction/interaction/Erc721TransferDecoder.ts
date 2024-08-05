import { AssetType } from '@narval/policy-engine-shared'
import { ContractCallInput, Intents } from '../../../domain'
import { DecoderError } from '../../../error'
import { Erc721SafeTransferFromParams } from '../../../extraction/types'
import { TransferErc721 } from '../../../intent.types'
import { MethodsMapping } from '../../../supported-methods'
import { isSupportedMethodId } from '../../../typeguards'
import { toAssetIdLowerCase, toChainAccountIdLowerCase } from '../../../utils'
import { extract } from '../../utils'

export const decodeErc721Transfer = (input: ContractCallInput, supportedMethods: MethodsMapping): TransferErc721 => {
  const { to: contract, from, chainId, data, methodId } = input
  if (!isSupportedMethodId(methodId)) {
    throw new DecoderError({ message: 'Unsupported methodId', status: 400 })
  }

  const params = extract(supportedMethods, data, methodId) as Erc721SafeTransferFromParams
  const { to, tokenId } = params

  const intent: TransferErc721 = {
    to: toChainAccountIdLowerCase({ chainId, address: to }),
    from: toChainAccountIdLowerCase({ chainId, address: from }),
    type: Intents.TRANSFER_ERC721,
    token: toAssetIdLowerCase({
      assetType: AssetType.ERC721,
      chainId,
      address: contract,
      assetId: tokenId.toString()
    }),
    contract: toChainAccountIdLowerCase({ chainId, address: contract })
  }

  return intent
}
