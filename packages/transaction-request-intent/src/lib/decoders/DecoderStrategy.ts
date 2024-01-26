import { Hex, decodeAbiParameters } from 'viem'
import { ValidatedInput } from '../domain'
import { ExtractedParams } from '../extraction/types'
import { Intent } from '../intent.types'
import { MethodsMapping, SUPPORTED_METHODS, SupportedMethodId } from '../supported-methods'

export default abstract class DecoderStrategy {
  #supportedMethods: MethodsMapping

  constructor(input: ValidatedInput, supportedMethods?: MethodsMapping) {
    this.#supportedMethods = supportedMethods || SUPPORTED_METHODS
  }

  protected getMethod(methodId: SupportedMethodId) {
    const method = this.#supportedMethods[methodId]
    if (!method) throw new Error('Unsupported methodId')
    return method
  }

  protected extract(data: Hex, methodId: SupportedMethodId): ExtractedParams {
    const method = this.getMethod(methodId)
    try {
      const params = decodeAbiParameters(method.abi, data)
      console.log('params', params)
      return method.transformer(params)
    } catch (error) {
      throw new Error(`Failed to decode abi parameters: ${error}`)
    }
  }

  abstract decode(): Intent
}
