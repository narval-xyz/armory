import { Hex, decodeAbiParameters } from 'viem'
import { DecoderError } from '../error'
import { ExtractedParams } from '../extraction/types'
import { MethodsMapping, SupportedMethodId } from '../supported-methods'

export const getMethod = (supportedMethods: MethodsMapping, methodId: SupportedMethodId) => {
  const method = supportedMethods[methodId]
  if (!method) {
    throw new DecoderError({ message: 'Unsupported methodId', status: 400 })
  }
  return method
}

export const extract = (supportedMethods: MethodsMapping, data: Hex, methodId: SupportedMethodId): ExtractedParams => {
  const method = getMethod(supportedMethods, methodId)
  try {
    const params = decodeAbiParameters(method.abi, data)
    return method.transformer(params)
  } catch (error) {
    throw new DecoderError({ message: 'Failed to decode abi parameters', status: 400, context: { error } })
  }
}
