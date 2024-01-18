import { AbiParameter, Hex, decodeAbiParameters, toBytes } from 'viem'
import {
  Erc20Methods,
  Erc20TransferAbi,
  Erc20TransferAbiParameters,
  Erc721SafeTransferFromAbiParameters,
  Erc721TransferAbi,
  TransferFromAbiParameters
} from './methodId'

export function decodeAbiParametersWrapper<TParams extends readonly AbiParameter[], TReturnType>(
  params: TParams,
  data: Hex
): TReturnType {
  return decodeAbiParameters(params, data) as unknown as TReturnType
}

// Todo: How can we typesafe the return value of decodeAbiParameters, without
// re-doing a lot of the work that is already done in viem
export const extractErc20TransferAmount = (data: Hex): string => {
  try {
    const paramValues = decodeAbiParameters(Erc20TransferAbiParameters, toBytes(data))

    const amount = paramValues[1]
    if (!amount) throw new Error('Malformed transaction request')
    return amount.toString()
  } catch (error) {
    // TODO (@Pierre, 18/01/24): Revisit the error handling.
    throw new Error('Malformed transaction request')
  }
}

export const extractErc20TransferFromAmount = (data: Hex): string => {
  const paramValues = decodeAbiParameters(TransferFromAbiParameters, data)

  const amount = paramValues[2]
  if (!amount) throw new Error('Malformed transaction request')
  return amount.toString()
}

export const extractErc20Amount = (data: Hex, methodId: string): string => {
  if (!(methodId in Erc20TransferAbi)) {
    throw new Error('Invalid methodId')
  }

  switch (methodId) {
    case Erc20Methods.TRANSFER:
      return extractErc20TransferAmount(data)
    case Erc20Methods.TRANSFER_FROM:
      return extractErc20TransferFromAmount(data)
    default:
      throw new Error('Invalid methodId')
  }
}

export const extractErc721AssetId = (data: Hex, methodId: string): string => {
  if (!(methodId in Erc721TransferAbi)) {
    throw new Error('Invalid methodId')
  }

  // No need for specific mapping here, tokenId is always the third parameter
  const paramValues = decodeAbiParameters(Erc721SafeTransferFromAbiParameters, data)

  if (!paramValues[2]) throw new Error('Malformed transaction request')
  return paramValues[2].toString()
}
