import { AssetType } from '@narval/authz-shared'
import { ContractCallInput, Intents } from '../../../domain'
import { Erc721SafeTransferFromParams } from '../../../extraction/types'
import { TransferErc721 } from '../../../intent.types'
import { MethodsMapping } from '../../../supported-methods'
import { isSupportedMethodId } from '../../../typeguards'
import { toAccountIdLowerCase, toAssetIdLowerCase } from '../../../utils'
import { extract } from '../../utils'

export const decodeErc721Transfer = (input: ContractCallInput, supportedMethods: MethodsMapping): TransferErc721 => {
  const { to: contract, from, chainId, data, methodId } = input
  if (!isSupportedMethodId(methodId)) {
    throw new Error('Unsupported methodId')
  }

  const params = extract(supportedMethods, data, methodId) as Erc721SafeTransferFromParams
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
}
