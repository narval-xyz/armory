import { AssetType } from '@narval/policy-engine-shared'
import { AbiParameter } from 'viem'
import { AssetTypeAndUnknown, Intents, Misc } from './domain'
import {
  ApproveAllowanceParamsTransform,
  CreateAccountParamsTransform,
  Erc1155SafeTransferFromParamsTransform,
  Erc721SafeTransferFromParamsTransform,
  ExecuteBatchV6ParamsTransform,
  ExecuteBatchV7ParamsTransform,
  ExecuteParamsTransform,
  TransferBatchTransferParamsTransform,
  TransferFromParamsTransform,
  TransferParamsTransform
} from './extraction/transformers'
import {
  ApproveAllowanceParams,
  CreateAccountParams,
  Erc1155SafeTransferFromParams,
  Erc721SafeTransferFromParams,
  ExecuteBatchV6Params,
  ExecuteBatchV7Params,
  ExecuteParams,
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

export const ExecuteBatchAbiParameters: AbiParameter[] = [
  {
    internalType: 'address[]',
    name: 'dest',
    type: 'address[]'
  },
  {
    internalType: 'bytes[]',
    name: 'func',
    type: 'bytes[]'
  }
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
      { internalType: 'address', name: 'sender', type: 'address' },
      { internalType: 'uint256', name: 'nonce', type: 'uint256' },
      { internalType: 'bytes', name: 'initCode', type: 'bytes' },
      { internalType: 'bytes', name: 'callData', type: 'bytes' },
      { internalType: 'uint256', name: 'verificationGasLimit', type: 'uint256' },
      { internalType: 'uint256', name: 'callGasLimit', type: 'uint256' },
      { internalType: 'uint256', name: 'preVerificationGas', type: 'uint256' },
      { internalType: 'uint256', name: 'maxPriorityFeePerGas', type: 'uint256' },
      { internalType: 'uint256', name: 'maxFeePerGas', type: 'uint256' },
      { internalType: 'bytes', name: 'paymasterAndData', type: 'bytes' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' }
    ],
    name: '_userOp',
    type: 'tuple[]'
  },
  {
    name: 'beneficiary',
    type: 'address'
  }
]

export const CreateAccountAbiParameters: AbiParameter[] = [
  {
    name: '_salt',
    type: 'bytes32'
  },
  {
    name: '_pubkey',
    type: 'bytes'
  }
]

export const ExecuteAbiParameters: AbiParameter[] = [
  {
    name: 'dest',
    type: 'address'
  },
  {
    name: 'value',
    type: 'uint256'
  },
  {
    name: 'func',
    type: 'bytes'
  }
]

export const ExecuteAndRevertAbiParameters: AbiParameter[] = [
  {
    name: '_to',
    type: 'address'
  },
  {
    name: '_value',
    type: 'uint256'
  },
  {
    name: '_data',
    type: 'bytes'
  },
  {
    name: '_operation',
    type: 'uint8' // operation type (call or delegatecall)
  }
]

export enum SupportedMethodId {
  TRANSFER = '0xa9059cbb',
  TRANSFER_FROM = '0x23b872dd',
  APPROVE = '0x095ea7b3',
  SAFE_TRANSFER_FROM = '0x42842e0e',
  SAFE_TRANSFER_FROM_WITH_BYTES = '0xb88d4fde',
  SAFE_BATCH_TRANSFER_FROM = '0x2eb2c2d6',
  SAFE_TRANSFER_FROM_WITH_BYTES_1155 = '0x3219a4b7',
  SAFE_TRANSFER_FROM_1155 = '0xf242432a',
  CREATE_ACCOUNT = '0x5fbfb9cf',
  EXECUTE = '0xb61d27f6',
  EXECUTE_AND_REVERT = '0x940d3c60',
  EXECUTE_BATCH_V6 = '0x18dfb3c7',
  EXECUTE_BATCH_V7 = '0x47e1da2a',
  NULL_METHOD_ID = '0x00000000'
}

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
  [SupportedMethodId.EXECUTE_AND_REVERT]: ExecuteParams
  [SupportedMethodId.EXECUTE_BATCH_V6]: ExecuteBatchV6Params
  [SupportedMethodId.EXECUTE_BATCH_V7]: ExecuteBatchV7Params
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
  [SupportedMethodId.CREATE_ACCOUNT]: {
    name: 'createAccount',
    abi: CreateAccountAbiParameters,
    transformer: CreateAccountParamsTransform,
    assetType: Misc.UNKNOWN,
    intent: Intents.DEPLOY_CONTRACT
  },
  [SupportedMethodId.EXECUTE]: {
    name: 'execute',
    abi: ExecuteAbiParameters,
    transformer: ExecuteParamsTransform,
    assetType: Misc.UNKNOWN,
    intent: Intents.USER_OPERATION
  },
  [SupportedMethodId.EXECUTE_AND_REVERT]: {
    name: 'executeAndRevert',
    abi: ExecuteAndRevertAbiParameters,
    transformer: ExecuteParamsTransform,
    assetType: Misc.UNKNOWN,
    intent: Intents.USER_OPERATION
  },
  [SupportedMethodId.EXECUTE_BATCH_V6]: {
    name: 'executeBatch',
    abi: ExecuteBatchAbiParameters,
    transformer: ExecuteBatchV6ParamsTransform,
    assetType: Misc.UNKNOWN,
    intent: Intents.USER_OPERATION
  },
  [SupportedMethodId.EXECUTE_BATCH_V7]: {
    name: 'executeBatch',
    abi: ExecuteBatchAbiParameters,
    transformer: ExecuteBatchV7ParamsTransform,
    assetType: Misc.UNKNOWN,
    intent: Intents.USER_OPERATION
  },
  [SupportedMethodId.NULL_METHOD_ID]: {
    name: 'empty data field',
    abi: [],
    transformer: () => ({}),
    assetType: Misc.UNKNOWN,
    intent: Intents.TRANSFER_NATIVE
  }
}

export const permitTypedData = {
  types: {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' }
    ],
    Permit: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' }
    ]
  },
  primaryType: 'Permit' as const
}

export const permit2TypedData = {
  types: {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' }
    ],
    Permit: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' }
    ]
  },
  primaryType: 'Permit' as const
}
