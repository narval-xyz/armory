import { toAccountId } from '@narval/authz-shared'
import { ContractDeploymentInput, ContractRegistry, Intents, WalletType } from '../../../domain'
import { DeployContract, DeployErc4337Wallet, DeploySafeWallet } from '../../../intent.types'
import { contractTypeLookup, toAccountIdLowerCase } from '../../../utils'
import DecoderStrategy from '../../DecoderStrategy'

type DeploymentIntent = DeployContract | DeployErc4337Wallet | DeploySafeWallet
export default class DeployContractDecoder extends DecoderStrategy {
  #input: ContractDeploymentInput

  #registry?: ContractRegistry

  constructor(input: ContractDeploymentInput, registry?: ContractRegistry) {
    super(input)
    this.#input = input
    this.#registry = registry
  }

  decode(): DeploymentIntent {
    const { from, chainId, data } = this.#input
    const fromType = contractTypeLookup(chainId, from, this.#registry)
    console.log('fromType', fromType)
    if (fromType?.factoryType === WalletType.SAFE) {
      // Return a DeploySafeWallet object
      return { type: Intents.DEPLOY_SAFE_WALLET, from: toAccountId({ chainId, address: from }), chainId }
    } else if (fromType?.factoryType === WalletType.ERC4337) {
      // Return a DeployErc4337Wallet object
      return {
        type: Intents.DEPLOY_ERC_4337_WALLET,
        from: toAccountIdLowerCase({ chainId, address: from }),
        chainId,
        bytecode: data
      }
    } else {
      // Return a DeployContract object
      return {
        type: Intents.DEPLOY_CONTRACT,
        from: toAccountIdLowerCase({ chainId, address: from }),
        chainId
      }
    }
  }
}
