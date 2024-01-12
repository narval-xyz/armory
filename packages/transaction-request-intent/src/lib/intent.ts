import { AssetTypeEnum, Intents, NATIVE_TRANSFER } from '../../src/utils/domain';
import { TransactionRequest } from '../../src/utils/transaction.type';
import { Intent } from '../../src/utils/intent.types';
import { decodeIntent } from './decoders';
import { AmbiguousAbi, Erc20TransferAbi, Erc721TransferAbi } from '../../src/utils/standard-functions/abis';
import { IntentRequest } from '../../src/shared/types';

const methodIdToAssetTypeMap: { [key: string]: AssetTypeEnum } = {
  ...Object.entries(Erc20TransferAbi).reduce((acc, [key]) => ({ ...acc, [key]: AssetTypeEnum.ERC20 }), {}),
  ...Object.entries(Erc721TransferAbi).reduce((acc, [key]) => ({ ...acc, [key]: AssetTypeEnum.ERC721 }), {}),
  ...Object.entries(AmbiguousAbi).reduce((acc, [key]) => ({ ...acc, [key]: AssetTypeEnum.AMBIGUOUS }), {}),
  [NATIVE_TRANSFER]: AssetTypeEnum.NATIVE,
};

export const determineType = (methodId: string): AssetTypeEnum => {
  return methodIdToAssetTypeMap[methodId] || AssetTypeEnum.UNKNOWN;
};

export const getIntentType = (assetType: AssetTypeEnum): Intents => {
  switch (assetType) {
    case AssetTypeEnum.ERC20:
      return Intents.TRANSFER_ERC20;
    case AssetTypeEnum.ERC721:
      return Intents.TRANSFER_ERC721;
    case AssetTypeEnum.ERC1155:
      return Intents.TRANSFER_ERC1155;
    case AssetTypeEnum.NATIVE:
      return Intents.TRANSFER_NATIVE;
    default:
      return Intents.CALL_CONTRACT;
  }
}

export const getMethodId = (data?: string): string => data ? data.slice(0, 10): NATIVE_TRANSFER;

export const validateErc20Intent = (txRequest: TransactionRequest) => {
  const { data, to, chainId } = txRequest;
  if (!data || !to || !chainId) {
    throw new Error('Malformed Erc20 transaction request');
  }
  return { data, to, chainId }
}

export const validateIntent = (txRequest: TransactionRequest): IntentRequest => {
  const { from, value, data, chainId } = txRequest;
  if (!from || !chainId) {
    throw new Error('Malformed transaction request: missing from or chainId');
  }
  if (!value && !data) {
    throw new Error('Malformed transaction request: missing value and data');
  }

  const methodId = getMethodId(data);
  const assetType = determineType(methodId);
  const type = getIntentType(assetType);

  switch (type) {
    case Intents.TRANSFER_ERC20:
      return {
        type,
        assetType,
        methodId,
        validatedFields: validateErc20Intent(txRequest),
      }
    default:
      throw new Error('Unsupported intent');
  }
};

export const decodeTransaction = (txRequest: TransactionRequest): Intent => {
  const request = validateIntent(txRequest);
  return decodeIntent(request);
};
