import {
  AccessToken,
  Action,
  Decision,
  EvaluationResponse,
  Request,
  SerializedTransactionRequest
} from '@narval/policy-engine-shared'
import { Jwk } from '@narval/signature'
import axios from 'axios'
import dotenv from 'dotenv'
import { Hex } from 'viem'
import { Endpoints } from './domain'
import { ConfigurationException, ForbiddenException, NarvalSdkException, NotImplementedException } from './exceptions'
import { signAccountJwsd, signRequest } from './utils'
dotenv.config()

type ValidatedEvaluationResponse = {
  request: Request
  accessToken: AccessToken
}

export type ArmoryClientConfigInput = {
  authHost?: string
  authSecret?: string
  vaultHost?: string
  vaultSecret?: string
  entityStoreHost?: string
  policyStoreHost?: string
  authClientId?: string
  vaultClientId?: string
  signer: Jwk
}

export type ArmoryClientConfig = {
  authHost: string
  authSecret: string
  vaultHost: string
  vaultSecret: string
  entityStoreHost: string
  policyStoreHost: string
  authClientId: string
  vaultClientId: string
  signer: Jwk
}

const getConfig = (params: ArmoryClientConfigInput): ArmoryClientConfig => {
  const authClientId = params.authClientId || process.env.ARMORY_CLIENT_ID
  const authSecret = params.authSecret || process.env.ARMORY_AUTH_SECRET
  const vaultClientId = params.vaultClientId || process.env.ARMORY_VAULT_CLIENT_ID
  const vaultSecret = params.vaultSecret || process.env.ARMORY_VAULT_SECRET

  if (!authClientId) {
    throw new ConfigurationException('Missing auth clientId')
  }
  if (!authSecret) {
    throw new ConfigurationException('Missing auth secret')
  }
  if (!vaultClientId) {
    throw new ConfigurationException('Missing vault clientId')
  }
  if (!vaultSecret) {
    throw new ConfigurationException('Missing vault secret')
  }

  const authHost = params.authHost || `https://cloud.narval.xyz/auth`
  const vaultHost = params.vaultHost || `https://cloud.narval.xyz/vault`
  const entityStoreHost = params.entityStoreHost || `https://cloud.narval.xyz/auth`
  const policyStoreHost = params.policyStoreHost || `https://cloud.narval.xyz/auth`

  return {
    authHost,
    vaultHost,
    authSecret,
    vaultClientId,
    vaultSecret,
    entityStoreHost,
    policyStoreHost,
    authClientId,
    signer: params.signer
  }
}

const serializeRequest = (request: Request) => {
  switch (request.action) {
    case Action.SIGN_TRANSACTION:
      return {
        ...request,
        transactionRequest: SerializedTransactionRequest.parse(request.transactionRequest)
      }
    default:
      return request
  }
}
const createEvaluate =
  (config: ArmoryClientConfig) =>
  async (request: Request): Promise<ValidatedEvaluationResponse> => {
    const created = async (request: Request): Promise<ValidatedEvaluationResponse> => {
      const { signer, authClientId, authHost, authSecret } = config

      const body = await signRequest(request, signer, authClientId)
      const url = `${authHost}${Endpoints.engine.evaluations}`

      const urlRequest = serializeRequest(request)
      const urlBody = {
        ...body,
        request: urlRequest
      }
      const { data } = await axios.post<EvaluationResponse>(url, urlBody, {
        headers: {
          'x-client-id': authClientId,
          'x-client-secret': authSecret
        }
      })

      switch (data.decision) {
        case Decision.PERMIT:
          if (!data.accessToken || !data.accessToken.value || !data.request) {
            throw new NarvalSdkException('Access token or validated request is missing', {
              evaluation: data,
              authHost,
              authClientId
            })
          }
          return {
            request: data.request,
            accessToken: data.accessToken
          }
        case Decision.CONFIRM:
          throw new NotImplementedException('Confirm is not implemented yet', {
            evaluation: data,
            authHost,
            authClientId
          })
        case Decision.FORBID:
          throw new ForbiddenException('Host denied access', {
            evaluation: data,
            authHost,
            authClientId
          })
      }
    }
    return created(request)
  }

const createSignRequest =
  (config: ArmoryClientConfig) =>
  async (request: Request, accessToken: AccessToken): Promise<Hex> => {
    const created = async (request: Request, accessToken: AccessToken): Promise<Hex> => {
      const { vaultHost, vaultClientId, signer } = config
      const uri = `${vaultHost}${Endpoints.vault.sign}`

      const urlRequest = serializeRequest(request)

      const detachedJws = await signAccountJwsd(
        {
          request
        },
        accessToken.value,
        signer,
        uri
      )

      const { data } = await axios.post(
        uri,
        { request: urlRequest },
        {
          headers: {
            'x-client-id': vaultClientId,
            'detached-jws': detachedJws,
            authorization: `GNAP ${accessToken.value}`
          }
        }
      )
      return data.signature
    }
    return created(request, accessToken)
  }

const createImportWalletRequest =
  (config: ArmoryClientConfig) =>
  async (privateKey: Hex, walletId: string): Promise<void> => {
    const created = async (privateKey: Hex, walletId: string): Promise<void> => {
      const body = {
        privateKey,
        walletId
      }
      const { vaultClientId, vaultSecret, vaultHost } = config
      const url = `${vaultHost}${Endpoints.vault.importPrivateKey}`

      const { data } = await axios.post(url, body, {
        headers: {
          'x-client-id': vaultClientId,
          'x-client-secret': vaultSecret
        }
      })
      return data
    }
    return created(privateKey, walletId)
  }

export type Armory = {
  evaluate: (request: Request) => Promise<ValidatedEvaluationResponse>
  signRequest: (request: Request, accessToken: AccessToken) => Promise<Hex>
  importWallet: (privateKey: Hex, walletId: string) => Promise<void>
}

export const createArmory = (params: ArmoryClientConfigInput): Armory => {
  const config = getConfig(params)

  return {
    evaluate: createEvaluate(config),
    signRequest: createSignRequest(config),
    importWallet: createImportWalletRequest(config)
  }
}
