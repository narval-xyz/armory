import { AssetType } from '@narval/authz-shared'
import { AbiParameter } from 'viem'
import { AssetTypeAndUnknown, Intents, Misc } from './domain'
import {
  ApproveAllowanceParamsTransform,
  CreateAccountParamsTransform,
  Erc1155SafeTransferFromParamsTransform,
  Erc721SafeTransferFromParamsTransform,
  ExecuteParamsTransform,
  HandleOpsParamsTransform,
  TransferBatchTransferParamsTransform,
  TransferFromParamsTransform,
  TransferParamsTransform
} from './extraction/transformers'
import {
  ApproveAllowanceParams,
  CreateAccountParams,
  Erc1155SafeTransferFromParams,
  Erc721SafeTransferFromParams,
  ExecuteParams,
  HandleOpsParams,
  NullHexParams,
  SafeBatchTransferFromParams,
  TransferFromParams,
  TransferParams
} from './extraction/types'

export const TransferFromAbiParameters: AbiParameter[] = [
  { type: 'address', name: 'sender' },
  { type: 'address', name: 'recipient' },
  { type: 'uint256', name: 'amount' }
]

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

export const Erc20TransferAbiParameters: AbiParameter[] = [
  { type: 'address', name: 'recipient' },
  { type: 'uint256', name: 'amount' }
]

export const ApproveAllowanceAbiParameters: AbiParameter[] = [
  { type: 'address', name: 'spender' },
  { type: 'uint256', name: 'amount' }
]

export const DeployContractAbiParameters: AbiParameter[] = [
  {
    name: '_initCode',
    type: 'bytes'
  },
  {
    name: '_salt',
    type: 'bytes32'
  }
]

export const HandleOpsAbiParameters: AbiParameter[] = [
  {
    components: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'bytes', name: '', type: 'bytes' },
      { internalType: 'bytes', name: '', type: 'bytes' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'bytes', name: '', type: 'bytes' },
      { internalType: 'bytes', name: '', type: 'bytes' }
    ],
    name: '_userOp',
    type: 'tuple[]'
  },
  {
    name: 'beneficiary',
    type: 'address'
  }
]

export enum SupportedMethodId {
  TRANSFER = '0xa9059cbb',
  TRANSFER_FROM = '0x23b872dd',
  APPROVE = '0x095ea7b3',
  SAFE_TRANSFER_FROM = '0x42842e0e',
  SAFE_TRANSFER_FROM_WITH_BYTES = '0xb88d4fde',
  SAFE_BATCH_TRANSFER_FROM = '0x2eb2c2d6',
  SAFE_TRANSFER_FROM_WITH_BYTES_1155 = '0xf242432a',
  SAFE_TRANSFER_FROM_1155 = '0xa22cb465',
  CREATE_ACCOUNT = '0x19c2a1b2',
  HANDLE_OPS = '0x1fad948c',
  EXECUTE = '0xdade6037',
  NULL_METHOD_ID = '0x00000000'
}

// !! this is not taking into account the 'bytes' parameter.
// To access this parameter, change the expected params and the data transformer associated to it.
export type StandardMethodsParams = {
  [SupportedMethodId.TRANSFER]: TransferParams
  [SupportedMethodId.TRANSFER_FROM]: TransferFromParams
  [SupportedMethodId.APPROVE]: ApproveAllowanceParams
  [SupportedMethodId.SAFE_TRANSFER_FROM]: Erc721SafeTransferFromParams
  [SupportedMethodId.SAFE_TRANSFER_FROM_WITH_BYTES]: Erc721SafeTransferFromParams
  [SupportedMethodId.SAFE_BATCH_TRANSFER_FROM]: SafeBatchTransferFromParams
  [SupportedMethodId.SAFE_TRANSFER_FROM_WITH_BYTES_1155]: Erc1155SafeTransferFromParams
  [SupportedMethodId.SAFE_TRANSFER_FROM_1155]: Erc1155SafeTransferFromParams
  [SupportedMethodId.CREATE_ACCOUNT]: CreateAccountParams
  [SupportedMethodId.EXECUTE]: ExecuteParams
  [SupportedMethodId.HANDLE_OPS]: HandleOpsParams
  [SupportedMethodId.NULL_METHOD_ID]: NullHexParams
}

export type MethodsMapping = {
  [K in keyof StandardMethodsParams]: {
    name: string
    abi: AbiParameter[]
    transformer: (params: unknown[]) => StandardMethodsParams[K]
    assetType: AssetTypeAndUnknown
    intent: Intents
  }
}

export const SUPPORTED_METHODS: MethodsMapping = {
  [SupportedMethodId.TRANSFER]: {
    name: 'transfer',
    abi: Erc20TransferAbiParameters,
    transformer: TransferParamsTransform,
    assetType: AssetType.ERC20,
    intent: Intents.TRANSFER_ERC20
  },
  [SupportedMethodId.TRANSFER_FROM]: {
    name: 'transferFrom',
    abi: TransferFromAbiParameters,
    transformer: TransferFromParamsTransform,
    assetType: Misc.UNKNOWN,
    intent: Intents.CALL_CONTRACT
  },
  [SupportedMethodId.SAFE_TRANSFER_FROM]: {
    name: 'safeTransferFrom',
    abi: Erc721SafeTransferFromAbiParameters,
    transformer: Erc721SafeTransferFromParamsTransform,
    assetType: AssetType.ERC721,
    intent: Intents.TRANSFER_ERC721
  },
  [SupportedMethodId.SAFE_TRANSFER_FROM_WITH_BYTES]: {
    name: 'safeTransferOverloadBytes',
    abi: Erc721SafeTransferFromBytesAbiParameters,
    transformer: Erc721SafeTransferFromParamsTransform,
    assetType: AssetType.ERC721,
    intent: Intents.TRANSFER_ERC721
  },
  [SupportedMethodId.SAFE_BATCH_TRANSFER_FROM]: {
    name: 'safeBatchTransferFrom',
    abi: Erc1155SafeBatchTransferFromAbiParameters,
    transformer: TransferBatchTransferParamsTransform,
    assetType: AssetType.ERC1155,
    intent: Intents.TRANSFER_ERC1155
  },
  [SupportedMethodId.SAFE_TRANSFER_FROM_WITH_BYTES_1155]: {
    name: 'safeTransferFrom',
    abi: Erc1155SafeTransferFromAbiParameters,
    transformer: Erc1155SafeTransferFromParamsTransform,
    assetType: AssetType.ERC1155,
    intent: Intents.TRANSFER_ERC1155
  },
  [SupportedMethodId.SAFE_TRANSFER_FROM_1155]: {
    name: 'safeTransferFrom',
    abi: Erc1155SafeTransferFromAbiParameters,
    transformer: Erc1155SafeTransferFromParamsTransform,
    assetType: AssetType.ERC1155,
    intent: Intents.TRANSFER_ERC1155
  },
  [SupportedMethodId.APPROVE]: {
    name: 'approve',
    abi: ApproveAllowanceAbiParameters,
    transformer: ApproveAllowanceParamsTransform,
    assetType: AssetType.ERC20,
    intent: Intents.APPROVE_TOKEN_ALLOWANCE
  },
  [SupportedMethodId.HANDLE_OPS]: {
    name: 'handleOps',
    abi: HandleOpsAbiParameters,
    transformer: HandleOpsParamsTransform,
    assetType: Misc.UNKNOWN,
    intent: Intents.USER_OPERATION
  },
  [SupportedMethodId.CREATE_ACCOUNT]: {
    name: 'createAccount',
    abi: [],
    transformer: CreateAccountParamsTransform,
    assetType: Misc.UNKNOWN,
    intent: Intents.DEPLOY_CONTRACT
  },
  [SupportedMethodId.EXECUTE]: {
    name: 'execute',
    abi: [],
    transformer: ExecuteParamsTransform,
    assetType: Misc.UNKNOWN,
    intent: Intents.CALL_CONTRACT
  },
  [SupportedMethodId.NULL_METHOD_ID]: {
    name: 'empty data field',
    abi: [],
    transformer: () => ({}),
    assetType: Misc.UNKNOWN,
    intent: Intents.TRANSFER_NATIVE
  }
}

// TODO FIX ME
console.log('### Testing lib-to-lib import', AssetType.ERC1155)
