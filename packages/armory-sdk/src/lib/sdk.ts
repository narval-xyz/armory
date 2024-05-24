import { Action, EvaluationRequest, JwtString, TransactionRequest } from '@narval/policy-engine-shared'
import { signJwt } from '@narval/signature'
import { v4 } from 'uuid'
import { Hex, createPublicClient, http } from 'viem'
import { ArmoryClientConfig, ArmoryClientConfigInput, EngineClientConfig, SdkEvaluationResponse } from './domain'
import { sendEvaluationRequest } from './http/policy-engine'
import { signRequest } from './http/vault'
import { buildDataPayload, getChainOrThrow, resourceId } from './utils'

export const createArmoryConfig = (config: ArmoryClientConfigInput): ArmoryClientConfig => {
  const authClientId = config.authClientId || process.env.ARMORY_CLIENT_ID
  const authSecret = config.authSecret || process.env.ARMORY_AUTH_SECRET
  const vaultClientId = config.vaultClientId || process.env.ARMORY_VAULT_CLIENT_ID

  const authHost = config.authHost || `https://cloud.narval.xyz/auth`
  const vaultHost = config.vaultHost || `https://cloud.narval.xyz/vault`
  const entityStoreHost = config.entityStoreHost || `https://cloud.narval.xyz/auth`
  const policyStoreHost = config.policyStoreHost || `https://cloud.narval.xyz/auth`

  const confirmedConfig = ArmoryClientConfig.parse({
    authHost,
    authClientId,
    authSecret,
    vaultHost,
    vaultClientId,
    entityStoreHost,
    policyStoreHost,
    jwk: config.jwk,
    alg: config.alg,
    signer: config.signer
  })

  return confirmedConfig
}

export const signData = async (config: EngineClientConfig, data: unknown): Promise<JwtString> => {
  const { authClientId, jwk, alg, signer } = config

  const payload = buildDataPayload(data, {
    sub: jwk.kid,
    iss: authClientId
  })

  return signJwt(payload, jwk, { alg }, signer)
}

export const sendTransaction = async (
  config: ArmoryClientConfig,
  transactionRequest: TransactionRequest
): Promise<Hex | SdkEvaluationResponse> => {
  const request: EvaluationRequest = {
    authentication: '',
    request: {
      action: Action.SIGN_TRANSACTION,
      resourceId: resourceId(transactionRequest.from),
      nonce: v4(),
      transactionRequest
    }
  }
  const evaluationResponse = await sendEvaluationRequest(config, request)
  const { accessToken } = evaluationResponse

  if (!accessToken) {
    return SdkEvaluationResponse.parse(evaluationResponse)
  }

  const { signature } = await signRequest(config, { ...request, accessToken })

  const chain = getChainOrThrow(transactionRequest.chainId)

  const publicClient = createPublicClient({
    transport: http(),
    chain
  })

  return publicClient.sendRawTransaction({ serializedTransaction: signature })
}

export { getAuthorizationRequest, sendAuthorizationRequest } from './http/armory'
export { getEntities, getPolicies, setEntities, setPolicies } from './http/data-store'
export { pingEngine, sendEvaluationRequest, syncEngine } from './http/policy-engine'
export { importPrivateKey, pingVault, signRequest } from './http/vault'
