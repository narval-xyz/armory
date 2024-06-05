import { JwtString, TransactionRequest } from '@narval/policy-engine-shared'
import { signJwt } from '@narval/signature'
import { Hex, createPublicClient, http } from 'viem'
import { ArmoryClientConfig, ArmoryClientConfigInput, EngineClientConfig } from './domain'
import { SendEvaluationResponse } from './types/policy-engine'
import { buildDataPayload, getChainOrThrow } from './utils'

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
  transactionRequest: TransactionRequest,
  signature: Hex
): Promise<Hex | SendEvaluationResponse> => {
  const chain = getChainOrThrow(transactionRequest.chainId)

  const publicClient = createPublicClient({
    transport: http(),
    chain
  })

  return publicClient.sendRawTransaction({ serializedTransaction: signature })
}

export { getAuthorizationRequest, onboardArmoryClient, sendAuthorizationRequest } from './http/armory'
export { getEntities, getPolicies, setEntities, setPolicies } from './http/data-store'
export { onboardEngineClient, pingEngine, sendEvaluationRequest, syncEngine } from './http/policy-engine'
export {
  deriveWallet,
  generateKey,
  importPrivateKey,
  importSeed,
  onboardVaultClient,
  pingVault,
  signRequest
} from './http/vault'
