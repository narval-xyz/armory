import { ContractDeploymentInput, ContractRegistry, Intents, WalletType } from '../../../domain'
import { DeployContract, DeployErc4337Wallet, DeploySafeWallet } from '../../../intent.types'
import { contractTypeLookup, toChainAccountIdLowerCase } from '../../../utils'

type DeploymentIntent = DeployContract | DeployErc4337Wallet | DeploySafeWallet

export const decodeContractDeployment = (
  input: ContractDeploymentInput,
  registry?: ContractRegistry
): DeploymentIntent => {
  const { from, chainId, data } = input
  const fromType = contractTypeLookup(chainId, from, registry)

  if (fromType?.factoryType === WalletType.SAFE) {
    // Return a DeploySafeWallet object
    return {
      type: Intents.DEPLOY_SAFE_WALLET,
      from: toChainAccountIdLowerCase({ chainId, address: from }),
      chainId
    }
  } else if (fromType?.factoryType === WalletType.ERC4337) {
    // Return a DeployErc4337Wallet object
    return {
      type: Intents.DEPLOY_ERC_4337_WALLET,
      from: toChainAccountIdLowerCase({ chainId, address: from }),
      chainId,
      bytecode: data
    }
  } else {
    // Return a DeployContract object
    return {
      type: Intents.DEPLOY_CONTRACT,
      from: toChainAccountIdLowerCase({ chainId, address: from }),
      chainId
    }
  }
}
