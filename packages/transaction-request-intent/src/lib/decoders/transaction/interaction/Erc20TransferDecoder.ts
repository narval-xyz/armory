import { AssetType } from '@narval/policy-engine-shared'
import { ContractCallInput, Intents } from '../../../domain'
import { DecoderError } from '../../../error'
import { TransferParams } from '../../../extraction/types'
import { TransferErc20 } from '../../../intent.types'
import { MethodsMapping } from '../../../supported-methods'
import { isSupportedMethodId } from '../../../typeguards'
import { toAssetIdLowerCase, toChainAccountIdLowerCase } from '../../../utils'
import { extract } from '../../utils'

export const decodeErc20Transfer = (input: ContractCallInput, supportedMethods: MethodsMapping): TransferErc20 => {
  const { from, to, chainId, data, methodId } = input
  if (!isSupportedMethodId(methodId)) {
    throw new DecoderError({ message: 'Unsupported methodId', status: 400 })
  }

  const params = extract(supportedMethods, data, methodId) as TransferParams
  const { amount, recipient } = params

  const intent: TransferErc20 = {
    to: toChainAccountIdLowerCase({ chainId, address: recipient }),
    from: toChainAccountIdLowerCase({ chainId, address: from }),
    type: Intents.TRANSFER_ERC20,
    amount,
    token: toAssetIdLowerCase({ assetType: AssetType.ERC20, chainId, address: to })
  }

  return intent
}
