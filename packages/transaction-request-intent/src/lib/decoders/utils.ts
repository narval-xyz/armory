import { Hex, decodeAbiParameters } from 'viem'
import { ExtractedParams } from '../extraction/types'
import { MethodsMapping, SupportedMethodId } from '../supported-methods'

export const getMethod = (supportedMethods: MethodsMapping, methodId: SupportedMethodId) => {
  const method = supportedMethods[methodId]
  if (!method) throw new Error('Unsupported methodId')
  return method
}

export const extract = (supportedMethods: MethodsMapping, data: Hex, methodId: SupportedMethodId): ExtractedParams => {
  const method = getMethod(supportedMethods, methodId)
  try {
    const params = decodeAbiParameters(method.abi, data)
    return method.transformer(params)
  } catch (error) {
    throw new Error(`Failed to decode abi parameters: ${error}`)
  }
}
