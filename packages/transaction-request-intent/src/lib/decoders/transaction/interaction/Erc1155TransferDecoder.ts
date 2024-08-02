import { AssetType, Hex, toAssetId } from '@narval/policy-engine-shared'
import { Address } from 'viem'
import { ContractCallInput, Intents } from '../../../domain'
import { DecoderError } from '../../../error'
import { Erc1155SafeTransferFromParams, SafeBatchTransferFromParams } from '../../../extraction/types'
import { ERC1155Transfer, TransferErc1155 } from '../../../intent.types'
import { MethodsMapping, SupportedMethodId } from '../../../supported-methods'
import { isSupportedMethodId } from '../../../typeguards'
import { toChainAccountIdLowerCase } from '../../../utils'
import { extract } from '../../utils'

export const decodeERC1155Transfer = (input: ContractCallInput, supportedMethods: MethodsMapping): TransferErc1155 => {
  const { to: contract, from, data, chainId, methodId } = input
  if (!isSupportedMethodId(methodId)) {
    throw new DecoderError({ message: 'Unsupported methodId', status: 400 })
  }

  const params = extract(supportedMethods, data, methodId)
  const transfers: ERC1155Transfer[] = []

  if (
    [SupportedMethodId.SAFE_TRANSFER_FROM_1155, SupportedMethodId.SAFE_TRANSFER_FROM_WITH_BYTES_1155].includes(methodId)
  ) {
    const { to, tokenId, amount } = params as Erc1155SafeTransferFromParams
    transfers.push(createERC1155Transfer({ contract, tokenId, amount, chainId }))

    return constructTransferErc1155Intent({ to, from, contract, transfers, chainId })
  } else if (methodId === SupportedMethodId.SAFE_BATCH_TRANSFER_FROM) {
    const { to, tokenIds, amounts } = params as SafeBatchTransferFromParams
    tokenIds.forEach((tokenId, index) => {
      transfers.push(createERC1155Transfer({ contract, tokenId, amount: amounts[index], chainId }))
    })

    return constructTransferErc1155Intent({ to, from, contract, transfers, chainId })
  }
  throw new DecoderError({ message: 'Params do not match ERC1155 transfer methodId', status: 400 })
}

function createERC1155Transfer({
  chainId,
  contract,
  tokenId,
  amount
}: {
  chainId: number
  contract: Hex
  tokenId: string
  amount: string
}): ERC1155Transfer {
  return {
    token: toAssetId({
      assetType: AssetType.ERC1155,
      chainId,
      address: contract,
      assetId: tokenId
    }),
    amount
  }
}

function constructTransferErc1155Intent({
  to,
  from,
  contract,
  transfers,
  chainId
}: {
  to: Address
  from: Address
  contract: Hex
  transfers: ERC1155Transfer[]
  chainId: number
}): TransferErc1155 {
  return {
    to: toChainAccountIdLowerCase({ chainId, address: to }),
    from: toChainAccountIdLowerCase({ chainId, address: from }),
    type: Intents.TRANSFER_ERC1155,
    transfers,
    contract: toChainAccountIdLowerCase({ chainId, address: contract })
  }
}
