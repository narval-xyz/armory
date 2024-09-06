import { Intents, NativeTransferInput } from '../../../domain'
import { CancelTransaction, TransferNative } from '../../../intent.types'
import { checkCancelTransaction, nativeCaip19, toChainAccountIdLowerCase } from '../../../utils'

export const decodeNativeTransfer = (input: NativeTransferInput): TransferNative | CancelTransaction => {
  const intentType = checkCancelTransaction(input)
  if (intentType === Intents.CANCEL_TRANSACTION) {
    return { type: intentType }
  }

  return {
    to: toChainAccountIdLowerCase({
      address: input.to,
      chainId: input.chainId
    }),
    from: toChainAccountIdLowerCase({
      address: input.from,
      chainId: input.chainId
    }),
    type: Intents.TRANSFER_NATIVE,
    amount: BigInt(input.value).toString(),
    token: nativeCaip19(input.chainId)
  }
}
