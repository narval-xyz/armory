import { AssetType, Hex, toAccountId, toAssetId } from '@narval/authz-shared'
import { Address } from 'viem'
import { ContractCallInput, Intents } from '../../../domain'
import { Erc1155SafeTransferFromParams, SafeBatchTransferFromParams } from '../../../extraction/types'
import { ERC1155Transfer, TransferErc1155 } from '../../../intent.types'
import { MethodsMapping, SupportedMethodId } from '../../../supported-methods'
import { isSupportedMethodId } from '../../../typeguards'
import { extract } from '../../utils'

export const decodeERC1155Transfer = (input: ContractCallInput, supportedMethods: MethodsMapping): TransferErc1155 => {
  const { to: contract, from, data, chainId, methodId } = input
  if (!isSupportedMethodId(methodId)) {
    throw new Error('Unsupported methodId')
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

  throw new Error('Params do not match ERC1155 transfer methodId')
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
    tokenId: toAssetId({
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
    to: toAccountId({ chainId, address: to }),
    from: toAccountId({ chainId, address: from }),
    type: Intents.TRANSFER_ERC1155,
    transfers,
    contract: toAccountId({ chainId, address: contract })
  }
}
