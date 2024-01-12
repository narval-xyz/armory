import { AbiParameter, decodeAbiParameters } from 'viem';
import { Erc20Methods } from './methodId';
import { Erc20TransferAbi, Erc20TransferAbiParameters, Erc721SafeTransferFromAbiParameters, Erc721TransferAbi, TransferFromAbiParameters } from './abis';

export function decodeAbiParametersWrapper<TParams extends readonly AbiParameter[], TReturnType>(
  params: TParams, 
  data: `0x${string}`
): TReturnType {
  return decodeAbiParameters(params, data) as unknown as TReturnType;
}

// To consider: if we want to typesafe the return value of decodeAbiParameters
// we end up with re-doing a lot of the work that is already done in viem
export const extractErc20TransferAmount = (data: `0x${string}`): string => {
  const paramValues = decodeAbiParameters<AbiParameter[]>(Erc20TransferAbiParameters, data);

  const amount = paramValues[1];
  if (!amount) throw new Error('Malformed transaction request');
  return amount.toString();
}

export const extractErc20TransferFromAmount = (data: `0x${string}`): string => {
  const paramValues = decodeAbiParameters(TransferFromAbiParameters, data);

    const amount = paramValues[2];
    if (!amount) throw new Error('Malformed transaction request');
    return amount.toString();
}

export const extractErc20Amount = (data: `0x${string}`, methodId: string): string => {
  if (!(methodId in Erc20TransferAbi)) {
    throw new Error('Invalid methodId');
  }

  switch (methodId) {
    case Erc20Methods.TRANSFER:
      return extractErc20TransferAmount(data);
    case Erc20Methods.TRANSFER_FROM:
      return extractErc20TransferFromAmount(data);
    default:
      throw new Error('Invalid methodId');
  }
}

export const extractErc721AssetId = (data: `0x${string}`, methodId: string): string => {
  if (!(methodId in Erc721TransferAbi)) {
    throw new Error('Invalid methodId');
  }

  // No need for specific mapping here, tokenId is always the third parameter
  const paramValues = decodeAbiParameters(Erc721SafeTransferFromAbiParameters, data);

  if (!paramValues[2]) throw new Error('Malformed transaction request');
  return paramValues[2].toString();
}
