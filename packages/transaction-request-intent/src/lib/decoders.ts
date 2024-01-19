import { TransactionRequest } from '@narval/authz-shared'
import { Hex } from 'viem'
import { Caip19, encodeEoaAccountId, encodeEoaAssetId } from './caip'
import {
  AssetTypeEnum,
  EipStandardEnum,
  Intents,
  NULL_METHOD_ID,
  TransactionCategory,
  TransactionStatus
} from './domain'
import { TransactionRequestIntentError } from './error'
import {
  CallContract,
  ERC1155Transfer,
  Intent,
  TransferErc1155,
  TransferErc20,
  TransferErc721,
  TransferNative
} from './intent.types'
import { AMBIGUOUS_FUNCTION, HEX_SIG_TO_INTENT } from './methodId'
import {
  assertHexString,
  extractors,
  isErc1155SafeTransferFromParams,
  isErc721SafeTransferFromParams,
  isSafeBatchTransferFromParams,
  isTransferParams
} from './param-extractors'
import {
  ContractCreationDecoders,
  ContractCreationIntents,
  ContractDeploymentDecoder,
  ContractDeploymentInput,
  ContractInteractionDecoder,
  ContractInteractionDecoders,
  ContractInteractionIntents,
  ContractRegistry,
  DecodeTransferInput,
  NativeTransferDecoder,
  NativeTransferDecoders,
  NativeTransferInput,
  NativeTransferIntents,
  TransactionInput,
  TransactionIntents,
  TransactionRegistry,
  ValidatedInput,
  Validator,
  ValidatorRegistry
} from './types'

export const getMethodId = (data?: string): Hex => (data ? assertHexString(data.slice(0, 10)) : NULL_METHOD_ID)

export const validateContractCallIntent: Validator = (
  txRequest: TransactionRequest,
  methodId: Hex
): DecodeTransferInput => {
  const { data, to, chainId, from, nonce } = txRequest
  if (!data || !to || !chainId || !nonce) {
    throw new TransactionRequestIntentError({
      message: 'Malformed transfer transaction request: missing data || chainId || to || nonce',
      status: 400,
      context: {
        chainId,
        data,
        to,
        nonce,
        txRequest
      }
    })
  }
  const dataWithoutMethodId = `0x${data.slice(10)}` as Hex
  return { nonce, data: dataWithoutMethodId, to, chainId, from, methodId }
}

export const validateNativeTransferIntent: Validator = (txRequest: TransactionRequest, methodId: Hex) => {
  const { value, chainId, to, from, nonce } = txRequest
  if (!value || !chainId || !to || !from || !nonce) {
    throw new TransactionRequestIntentError({
      message: 'Malformed native transfer transaction request: missing value or chainId',
      status: 400,
      context: {
        value,
        chainId,
        txRequest
      }
    })
  }
  return { to, from, value, chainId, nonce, methodId }
}

const decodeErc721Transfer: ContractInteractionDecoder = ({
  to,
  from,
  data,
  chainId,
  methodId
}: DecodeTransferInput): TransferErc721 => {
  const params = extractors[methodId](data, methodId)
  if (!isErc721SafeTransferFromParams(params)) {
    throw new TransactionRequestIntentError({
      message: 'Failed to retrieve params for erc721 function',
      status: 400,
      context: {
        data,
        methodId,
        params
      }
    })
  }
  const intent: TransferErc721 = {
    to: encodeEoaAccountId({
      chainId,
      evmAccountAddress: params.to
    }),
    from: encodeEoaAccountId({
      chainId,
      evmAccountAddress: from
    }),
    type: Intents.TRANSFER_ERC721,
    nftId: encodeEoaAssetId({
      eipStandard: EipStandardEnum.EIP155,
      assetType: AssetTypeEnum.ERC721,
      chainId,
      evmAccountAddress: to,
      tokenId: params.tokenId.toString()
    }),
    contract: encodeEoaAccountId({
      chainId,
      evmAccountAddress: to
    })
  }
  return intent
}

const decodeDeployContract: ContractDeploymentDecoder = ({ from }: ContractDeploymentInput): Intent => {
  const intent = { from }
  return intent as Intent
}

const decodeErc20Transfer: ContractInteractionDecoder = ({
  to,
  from,
  data,
  chainId,
  methodId
}: DecodeTransferInput): TransferErc20 => {
  // if (methodId === AmbiguousMethods.TRANSFER_FROM) {
  //   return decodeTransferFrom({
  //     to,
  //     from,
  //     data,
  //     chainId,
  //     methodId,
  //     type: Intents.TRANSFER_ERC20
  //   }) as
  // }
  const params = extractors[methodId](data, methodId)
  if (!isTransferParams(params)) {
    throw new TransactionRequestIntentError({
      message: 'Failed to retrieve params for erc20 function',
      status: 400,
      context: {
        data,
        methodId,
        params
      }
    })
  }
  const intent: TransferErc20 = {
    to: encodeEoaAccountId({
      chainId,
      evmAccountAddress: params.recipient
    }),
    from: encodeEoaAccountId({
      chainId,
      evmAccountAddress: from
    }),
    type: Intents.TRANSFER_ERC20,
    amount: params.amount,
    contract: encodeEoaAccountId({
      chainId,
      evmAccountAddress: to
    })
  }
  return intent
}

// const decodeTransferFrom = ({
//   to,
//   from,
//   data,
//   chainId,
//   methodId,
//   type
// }: DecodeTransferInput & {type: Intents.TRANSFER_ERC20 | Intents.TRANSFER_ERC721}): TransferErc20 | TransferErc721 => {
//   const params = extractors[methodId](data, methodId)
//   if (!isTransferFromParams(params)) {
//     throw new TransactionRequestIntentError({
//       message: 'Failed to retrieve params for erc20 function',
//       status: 400,
//       context: {
//         data,
//         methodId,
//         params
//       }
//     })
//   }
//   if (type === Intents.TRANSFER_ERC20) {
//     const intent: TransferErc20 = {
//       to: encodeEoaAccountId({
//         chainId,
//         evmAccountAddress: params.recipient
//       }),
//       from: encodeEoaAccountId({
//         chainId,
//         evmAccountAddress: from
//       }),
//       type: Intents.TRANSFER_ERC20,
//       amount: params.amount,
//       contract: encodeEoaAccountId({
//         chainId,
//         evmAccountAddress: to
//       })
//     }
//     return intent;
//   }
//   const intent: TransferErc721 = {
//     to: encodeEoaAccountId({
//       chainId,
//       evmAccountAddress: params.recipient
//     }),
//     from: encodeEoaAccountId({
//       chainId,
//       evmAccountAddress: from
//     }),
//     type: Intents.TRANSFER_ERC721,
//     nftId: encodeEoaAssetId({
//       eipStandard: EipStandardEnum.EIP155,
//       assetType: AssetTypeEnum.ERC721,
//       chainId,
//       evmAccountAddress: to,
//       tokenId: params.amount.toString()
//     }),
//     contract: encodeEoaAccountId({
//       chainId,
//       evmAccountAddress: to
//     })
//   }
//   return intent
// }

const decodeErc1155: ContractInteractionDecoder = ({
  to,
  from,
  data,
  chainId,
  methodId
}: DecodeTransferInput): TransferErc1155 => {
  const params = extractors[methodId](data, methodId)
  const transfers: ERC1155Transfer[] = []
  if (isSafeBatchTransferFromParams(params)) {
    if (params.amounts.length !== params.tokenIds.length) {
      throw new TransactionRequestIntentError({
        message: 'Not the same number of amounts and ids',
        status: 400,
        context: {
          data,
          methodId,
          params
        }
      })
    }
    params.tokenIds.forEach((tokenId, index) => {
      transfers.push({
        tokenId: encodeEoaAssetId({
          eipStandard: EipStandardEnum.EIP155,
          assetType: AssetTypeEnum.ERC1155,
          chainId,
          evmAccountAddress: to,
          tokenId
        }),
        amount: params.amounts[index]
      })
    })
  } else if (isErc1155SafeTransferFromParams(params)) {
    transfers.push({
      tokenId: encodeEoaAssetId({
        eipStandard: EipStandardEnum.EIP155,
        assetType: AssetTypeEnum.ERC1155,
        chainId,
        evmAccountAddress: to,
        tokenId: params.tokenId
      }),
      amount: params.amount
    })
  } else {
    throw new TransactionRequestIntentError({
      message: 'Failed to retrieve params for erc1155 function',
      status: 400,
      context: {
        data,
        methodId,
        params
      }
    })
  }
  const intent: TransferErc1155 = {
    to: encodeEoaAccountId({
      chainId,
      evmAccountAddress: params.to
    }),
    from: encodeEoaAccountId({
      chainId,
      evmAccountAddress: from
    }),
    contract: encodeEoaAccountId({
      chainId,
      evmAccountAddress: to
    }),
    type: Intents.TRANSFER_ERC1155,
    transfers
  }
  return intent
}

const nativeCaip19 = (chainId: number): Caip19 => {
  if (chainId === 1) {
    return 'eip155:1/slip44/60' as Caip19
  } else if (chainId === 137) {
    return 'eip155:137/slip44/966' as Caip19
  }
  throw new TransactionRequestIntentError({
    message: 'Invalid chainId',
    status: 400,
    context: {
      chainId
    }
  })
}
const decodeNativeTransfer: NativeTransferDecoder = ({ to, from, value, chainId }: NativeTransferInput) => {
  const intent: TransferNative = {
    to: encodeEoaAccountId({
      chainId,
      evmAccountAddress: to
    }),
    from: encodeEoaAccountId({
      chainId,
      evmAccountAddress: from
    }),
    type: Intents.TRANSFER_NATIVE,
    amount: Number(value).toString(),
    token: nativeCaip19(chainId)
  }
  return intent
}

const decodeContractCall = ({ to, from, chainId, methodId }: DecodeTransferInput): CallContract => {
  const intent: CallContract = {
    from: encodeEoaAccountId({
      chainId,
      evmAccountAddress: from
    }),
    type: Intents.CALL_CONTRACT,
    contract: encodeEoaAccountId({
      chainId,
      evmAccountAddress: to
    }),
    hexSignature: methodId
  }
  return intent
}

// const decodeSignMessage = ({}) => {}

// const decodeSignRawMessage = ({}) => {}

// const decodeSignRawPayload = ({}) => {}

// const decodeSignTypedData = ({}) => {}

// const decodeRetryTransaction = ({}) => {}

// const decodeCancelTransaction = ({}) => {}

// const decodeDeployContract = ({}) => {}

// const decodeDeployErc4337Wallet = ({}) => {}

// const decodeDeploySafeWallet = ({}) => {}

// const decodeApproveTokenAllowance = ({}) => {}

// const decodePermit = ({}) => {}

// const decodePermit2 = ({}) => {}

const validators: ValidatorRegistry = {
  [TransactionCategory.NATIVE_TRANSFER]: validateNativeTransferIntent,
  [TransactionCategory.CONTRACT_CREATION]: validateContractCallIntent,
  [TransactionCategory.CONTRACT_INTERACTION]: validateContractCallIntent
}

const contractCreationDecoders: ContractCreationDecoders = {
  [Intents.DEPLOY_CONTRACT]: decodeDeployContract,
  [Intents.DEPLOY_ERC_4337_WALLET]: decodeDeployContract,
  [Intents.DEPLOY_SAFE_WALLET]: decodeDeployContract
}

const nativeTransferDecoders: NativeTransferDecoders = {
  [Intents.TRANSFER_NATIVE]: decodeNativeTransfer
}

const contractInteractionDecoders: ContractInteractionDecoders = {
  [Intents.TRANSFER_ERC20]: decodeErc20Transfer,
  [Intents.TRANSFER_ERC721]: decodeErc721Transfer,
  [Intents.TRANSFER_ERC1155]: decodeErc1155,
  [Intents.CALL_CONTRACT]: decodeContractCall,
  [Intents.APPROVE_TOKEN_ALLOWANCE]: decodeErc20Transfer,
  [Intents.RETRY_TRANSACTION]: decodeDeployContract,
  [Intents.CANCEL_TRANSACTION]: decodeDeployContract
}

const contractTypeLookup = (
  txRequest: ValidatedInput,
  contractRegistry: ContractRegistry
): AssetTypeEnum | undefined => {
  if ('to' in txRequest && txRequest.to) {
    const key = encodeEoaAccountId({
      chainId: txRequest.chainId,
      evmAccountAddress: txRequest.to
    })
    return contractRegistry[key]
  }
  return undefined
}

const transactionLookup = (
  txRequest: ValidatedInput,
  transactionRegistry?: TransactionRegistry
): TransactionStatus | undefined => {
  const account = encodeEoaAccountId({
    chainId: txRequest.chainId,
    evmAccountAddress: txRequest.from
  })
  const key = `${account}-${txRequest.nonce}`
  if (transactionRegistry) {
    return transactionRegistry[key]
  }
  return undefined
}

const getTransactionIntentType = (
  methodId: string,
  txRequest: ValidatedInput,
  contractRegistry?: ContractRegistry,
  transactionRegistry?: TransactionRegistry
): TransactionIntents => {
  const trxStatus = transactionLookup(txRequest, transactionRegistry)
  if (trxStatus === TransactionStatus.PENDING) {
    return Intents.RETRY_TRANSACTION
  }
  if (trxStatus === TransactionStatus.FAILED) {
    return Intents.CANCEL_TRANSACTION
  }
  if (methodId === NULL_METHOD_ID) {
    return Intents.TRANSFER_NATIVE
  }
  if (AMBIGUOUS_FUNCTION[methodId] && contractRegistry) {
    const assetType = contractTypeLookup(txRequest, contractRegistry)
    if (assetType === AssetTypeEnum.ERC721) {
      return Intents.TRANSFER_ERC721
    }
    if (assetType === AssetTypeEnum.ERC20) {
      return Intents.TRANSFER_ERC20
    }
  }
  return HEX_SIG_TO_INTENT[methodId] || Intents.CALL_CONTRACT
}

export const getCategory = (methodId: string, to?: Hex | null): TransactionCategory => {
  if (methodId === NULL_METHOD_ID) {
    return TransactionCategory.NATIVE_TRANSFER
  }
  if (to === null) {
    return TransactionCategory.CONTRACT_CREATION
  }
  return TransactionCategory.CONTRACT_INTERACTION
}

export const decodeTransaction = ({ txRequest, transactionRegistry, contractRegistry }: TransactionInput): Intent => {
  const { data } = txRequest
  const methodId = getMethodId(data)
  const category = getCategory(methodId, txRequest.to)
  const validatedTxRequest = validators[category](txRequest, methodId)
  const type = getTransactionIntentType(methodId, validatedTxRequest, contractRegistry, transactionRegistry)

  switch (category) {
    case TransactionCategory.NATIVE_TRANSFER:
      return nativeTransferDecoders[type as NativeTransferIntents](validatedTxRequest as NativeTransferInput)
    case TransactionCategory.CONTRACT_INTERACTION:
      return contractInteractionDecoders[type as ContractInteractionIntents](validatedTxRequest as DecodeTransferInput)
    case TransactionCategory.CONTRACT_CREATION:
      return contractCreationDecoders[type as ContractCreationIntents](validatedTxRequest as ContractDeploymentInput)
  }
}

// export const decodeMessage = ({
//   message
// }: MessageInput): Intent => {
//   const { chainId, from } = message
//   return
// }

// export const decodeRaw = ({
//   raw
// }: RawInput): Intent => {
//   const { rawData } = raw
//   return
// }

// export const decodeTypedData = ({
//   typedData
// }: TypedDataInput): Intent => {
//   const { chainId, from } = typedData
//   return
// }
