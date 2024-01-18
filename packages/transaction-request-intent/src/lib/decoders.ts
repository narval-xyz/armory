import { Hex } from 'viem'
import { encodeEoaAccountId } from './caip'
import { AssetTypeEnum, Intents, NULL_METHOD_ID, TransactionCategory, TransactionStatus } from './domain'
import { TransactionRequestIntentError } from './error'
import { Intent, TransferErc20 } from './intent.types'
import { AMBIGUOUS_FUNCTION, HEX_SIG_TO_INTENT } from './methodId'
import { extractErc20Amount } from './param-extractors'
import { TransactionRequest } from '@narval/authz-shared'
import { ContractRegistry, DecodeErc20Input, DecoderRegistry, TransactionInput, TransactionRegistry } from './types'

export const getMethodId = (data?: string): string => (data ? data.slice(0, 10) : NULL_METHOD_ID)

type ValidatedContractCallInput = {
  data: Hex
  to: Hex
  chainId: number
  from: Hex
  nonce: number
}

export const validateContractCallIntent = (txRequest: TransactionRequest): ValidatedContractCallInput => {
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
  return { nonce, data, to, chainId, from }
}

export const validateNativeTransferIntent = (txRequest: TransactionRequest) => {
  const { value, chainId } = txRequest
  if (!value || !chainId) {
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
  return { value, chainId }
}

// const decodeErc721 = ({
//   data,
//   methodId,
//   chainId,
//   assetType,
//   to
// }: {
//   data: Hex
//   methodId: string
//   chainId: number
//   assetType: AssetTypeEnum
//   to: Hex
// }) => {
//   const intent: TransferErc721 = {
//     to: encodeEoaAccountId({
//       chainId,
//       evmAccountAddress: to
//     }),
//     from: encodeEoaAccountId({
//       chainId,
//       evmAccountAddress: to
//     }),
//     type: Intents.TRANSFER_ERC721,
//     nftId: encodeEoaAssetId({
//       eipStandard: EipStandardEnum.EIP155,
//       assetType,
//       chainId,
//       evmAccountAddress: to,
//       tokenId: extractErc721AssetId(data, methodId)
//     }),
//     contract: encodeEoaAccountId({
//       chainId,
//       evmAccountAddress: to
//     })
//   }
//   return intent
// }

const decodeErc20 = ({ to, from, data, chainId, methodId }: DecodeErc20Input): TransferErc20 => {
  const intent: TransferErc20 = {
    to: encodeEoaAccountId({
      chainId,
      evmAccountAddress: to
    }),
    from: encodeEoaAccountId({
      chainId,
      evmAccountAddress: from
    }),
    type: Intents.TRANSFER_ERC20,
    amount: extractErc20Amount(data, methodId),
    contract: encodeEoaAccountId({
      chainId,
      evmAccountAddress: to
    })
  }
  return intent
}

// const decodeNativeTransferIntent = ({}) => {}

// const decodeErc1155 = ({}) => {}

// const decodeContractCall = ({}) => {}

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

const validators = {
  [TransactionCategory.NATIVE_TRANSFER]: validateNativeTransferIntent,
  // [TransactionCategory.CONTRACT_CREATION]: validateContractCreationIntent,
  [TransactionCategory.CONTRACT_INTERACTION]: validateContractCallIntent
}

const decoders: DecoderRegistry = {
  [Intents.TRANSFER_NATIVE]: decodeErc20,
  [Intents.TRANSFER_ERC20]: decodeErc20,
  [Intents.TRANSFER_ERC721]: decodeErc20,
  [Intents.TRANSFER_ERC1155]: decodeErc20,
  [Intents.CALL_CONTRACT]: decodeErc20,
  [Intents.SIGN_MESSAGE]: decodeErc20,
  [Intents.SIGN_RAW_MESSAGE]: decodeErc20,
  [Intents.SIGN_RAW_PAYLOAD]: decodeErc20,
  [Intents.SIGN_TYPED_DATA]: decodeErc20,
  [Intents.RETRY_TRANSACTION]: decodeErc20,
  [Intents.CANCEL_TRANSACTION]: decodeErc20,
  [Intents.DEPLOY_CONTRACT]: decodeErc20,
  [Intents.DEPLOY_ERC_4337_WALLET]: decodeErc20,
  [Intents.DEPLOY_SAFE_WALLET]: decodeErc20,
  [Intents.APPROVE_TOKEN_ALLOWANCE]: decodeErc20,
  [Intents.PERMIT]: decodeErc20,
  [Intents.PERMIT2]: decodeErc20
}

// const decoders: DecoderRegistry = {
//   [Intents.TRANSFER_NATIVE]: decodeNativeTransferIntent,
//   [Intents.TRANSFER_ERC20]: decodeErc20,
//   [Intents.TRANSFER_ERC721]: decodeErc721,
//   [Intents.TRANSFER_ERC1155]: decodeErc1155,
//   [Intents.CALL_CONTRACT]: decodeContractCall,
//   [Intents.SIGN_MESSAGE]: decodeSignMessage,
//   [Intents.SIGN_RAW_MESSAGE]: decodeSignRawMessage,
//   [Intents.SIGN_RAW_PAYLOAD]: decodeSignRawPayload,
//   [Intents.SIGN_TYPED_DATA]: decodeSignTypedData,
//   [Intents.RETRY_TRANSACTION]: decodeRetryTransaction,
//   [Intents.CANCEL_TRANSACTION]: decodeCancelTransaction,
//   [Intents.DEPLOY_CONTRACT]: decodeDeployContract,
//   [Intents.DEPLOY_ERC_4337_WALLET]: decodeDeployErc4337Wallet,
//   [Intents.DEPLOY_SAFE_WALLET]: decodeDeploySafeWallet,
//   [Intents.APPROVE_TOKEN_ALLOWANCE]: decodeApproveTokenAllowance,
//   [Intents.PERMIT]: decodePermit,
//   [Intents.PERMIT2]: decodePermit2,
// }

const contractTypeLookup = (
  txRequest: ValidatedContractCallInput,
  contractRegistry: ContractRegistry
): AssetTypeEnum | undefined => {
  const key = encodeEoaAccountId({
    chainId: txRequest.chainId,
    evmAccountAddress: txRequest.to
  })
  const assetType = contractRegistry[key]
  return assetType
}

const transactionLookup = (
  txRequest: ValidatedContractCallInput,
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

const getIntentType = (
  methodId: string,
  txRequest: ValidatedContractCallInput,
  contractRegistry?: ContractRegistry,
  transactionRegistry?: TransactionRegistry
): Intents => {
  const trxStatus = transactionLookup(txRequest, transactionRegistry)
  if (trxStatus === TransactionStatus.PENDING) {
    return Intents.RETRY_TRANSACTION
  }
  if (trxStatus === TransactionStatus.FAILED) {
    return Intents.CANCEL_TRANSACTION
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

export const decodeTransaction = ({ txRequest, transactionRegistry, contractRegistry }: TransactionInput): Intent => {
  const { data } = txRequest
  const methodId = getMethodId(data)
  const validatedTxRequest = validators[TransactionCategory.CONTRACT_INTERACTION](txRequest)
  const type = getIntentType(methodId, validatedTxRequest, contractRegistry, transactionRegistry)

  return decoders[type]({ ...validatedTxRequest, methodId })
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
