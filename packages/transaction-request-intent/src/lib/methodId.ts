import { AbiParameter } from 'viem'
import { Intents } from './domain'

export type Erc20MethodId = keyof typeof Erc20TransferAbi
export type Erc721MethodId = keyof typeof Erc721TransferAbi

export const Erc20Methods = {
  TRANSFER: '0xa9059cbb',
  TRANSFER_FROM: '0x23b872dd'
}

export const Erc721Methods = {
  TRANSFER_FROM: '0x23b872dd',
  SAFE_TRANSFER_FROM: '0x42842e0e',
  SAFE_TRANSFER_FROM_WITH_BYTES: '0xb88d4fde'
}

export const Erc1155Methods = {
  SAFE_TRANSFER_FROM: '0xa22cb465',
  SAFE_BATCH_TRANSFER_FROM: '0xf242432a'
}

export const HEX_SIG_TO_INTENT: { [methodId: string]: Intents } = {
  [Erc20Methods.TRANSFER]: Intents.TRANSFER_ERC20,
  [Erc721Methods.SAFE_TRANSFER_FROM]: Intents.TRANSFER_ERC721,
  [Erc721Methods.SAFE_TRANSFER_FROM_WITH_BYTES]: Intents.TRANSFER_ERC721,
  [Erc1155Methods.SAFE_TRANSFER_FROM]: Intents.TRANSFER_ERC1155,
  [Erc1155Methods.SAFE_BATCH_TRANSFER_FROM]: Intents.TRANSFER_ERC1155
}

export const Erc20TransferAbiParameters: AbiParameter[] = [
  { type: 'address', name: 'recipient' },
  { type: 'uint256', name: 'amount' }
]

export const TransferFromAbiParameters: AbiParameter[] = [
  { type: 'address', name: 'sender' },
  { type: 'address', name: 'recipient' },
  { type: 'uint256', name: 'amount' }
]

export const Erc20TransferAbi = {
  '0xa9059cbb': Erc20TransferAbiParameters
}

export const AMBIGUOUS_FUNCTION: { [key: string]: AbiParameter[] } = {
  '0x23b872dd': TransferFromAbiParameters
}

export const Erc721SafeTransferFromAbiParameters: AbiParameter[] = [
  { type: 'address', name: 'from' },
  { type: 'address', name: 'to' },
  { type: 'uint256', name: 'tokenId' }
]

export const Erc721SafeTransferFromBytesAbiParameters: AbiParameter[] = [
  { type: 'address', name: 'from' },
  { type: 'address', name: 'to' },
  { type: 'uint256', name: 'tokenId' },
  { type: 'bytes', name: 'data' }
]

export const Erc721TransferAbi = {
  '0x42842e0e': Erc721SafeTransferFromAbiParameters,
  '0xb88d4fde': Erc721SafeTransferFromBytesAbiParameters
}

export const Erc1155SafeTransferFromAbiParameters: AbiParameter[] = [
  {
    name: 'from',
    type: 'address'
  },
  {
    name: 'to',
    type: 'address'
  },
  {
    name: 'id',
    type: 'uint256'
  },
  {
    name: 'amount',
    type: 'uint256'
  },
  {
    name: 'data',
    type: 'bytes'
  }
]

export const Erc1155SafeBatchTransferFromAbiParameters: AbiParameter[] = [
  {
    name: 'from',
    type: 'address'
  },
  {
    name: 'to',
    type: 'address'
  },
  {
    name: 'ids',
    type: 'uint256[]'
  },
  {
    name: 'amounts',
    type: 'uint256[]'
  },
  {
    name: 'data',
    type: 'bytes'
  }
]

export const Erc1155TransferAbi = {
  '0xa22cb465': Erc1155SafeTransferFromAbiParameters,
  '0xf242432a': Erc1155SafeBatchTransferFromAbiParameters
}
