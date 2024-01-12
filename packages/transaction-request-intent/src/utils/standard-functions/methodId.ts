import { Erc20TransferAbi, Erc721TransferAbi } from './abis';

export type Erc20MethodId = keyof typeof Erc20TransferAbi;
export type Erc721MethodId = keyof typeof Erc721TransferAbi;

export const Erc20Methods = {
  TRANSFER: '0xa9059cbb',
  TRANSFER_FROM: '0x23b872dd',
};

export const Erc721Methods = {
  TRANSFER_FROM: '0x23b872dd',
  SAFE_TRANSFER_FROM: '0x40c10f19',
  SAFE_TRNSFER_FROM_WITH_BYTES: '0xb88d4fde',
};

export const Erc1155Methods = {
  SAFE_TRANSFER_FROM: '0xa22cb465',
  SAFE_BATCH_TRANSFER_FROM: '0xf242432a',
};
