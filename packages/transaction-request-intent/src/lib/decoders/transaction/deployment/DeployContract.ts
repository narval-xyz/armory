import { toCaip10 } from '@narval/authz-shared'
import { ContractDeploymentInput, Intents } from '../../../domain'
import { DeployContract } from '../../../intent.types'
import DecoderStrategy from '../../DecoderStrategy'

export default class DeployContractDecoder extends DecoderStrategy {
  #input: ContractDeploymentInput

  constructor(input: ContractDeploymentInput) {
    super(input)
    this.#input = input
  }

  decode(): DeployContract {
    const { from, chainId } = this.#input
    const intent: DeployContract = {
      type: Intents.DEPLOY_CONTRACT,
      from: toCaip10({ chainId, address: from }),
      chainId
    }
    return intent
  }
}
