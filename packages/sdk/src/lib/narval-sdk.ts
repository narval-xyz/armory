import {
  AccessToken,
  Entities,
  EntityStore,
  EvaluationRequest,
  EvaluationResponse,
  JwtString,
  Policy,
  PolicyStore,
  Request,
  SignTransactionAction
} from '@narval/policy-engine-shared'
import {
  Jwk,
  JwsdHeader,
  Payload,
  SigningAlg,
  hash,
  hexToBase64Url,
  privateKeyToHex,
  signJwsd,
  signJwt
} from '@narval/signature'
import axios from 'axios'
import { Address, Chain, Hex, LocalAccount, createWalletClient, custom } from 'viem'
import { signMessage } from 'viem/accounts'
import { Endpoints, SignConfig } from './domain'
import { NarvalRpcError, NarvalRpcRequest, NarvalRpcSchema, RpcErrorCode, RpcMethod } from './rpc'

export type VaultAccount = LocalAccount & {
  jwk: Jwk
}

const signAccountJwsd = async (payload: Request, accessToken: string, jwk: Jwk) => {
  if (!jwk.kid) {
    throw new Error('kid is required')
  }

  const signer = async (message: string) => {
    const privateKey = await privateKeyToHex(jwk)
    const signature = await signMessage({ message, privateKey })

    return hexToBase64Url(signature)
  }

  const jwsdHeader: JwsdHeader = {
    alg: SigningAlg.EIP191,
    kid: jwk.kid,
    typ: 'gnap-binding-jwsd',
    htm: 'POST',
    uri: 'http://localhost:3011/sign',
    created: new Date().getTime(),
    ath: hexToBase64Url(hash(accessToken))
  }

  const signature = await signJwsd(payload, jwsdHeader, signer).then((jws) => {
    const parts = jws.split('.')
    parts[1] = ''
    return parts.join('.')
  })

  return signature
}

export const importWallet = async (privateKey: Hex, walletId?: string): Promise<{ id: string; address: Address }> => {
  const body = {
    privateKey,
    walletId
  }
  const id = process.env.VAULT_CLIENT_ID
  const secret = process.env.VAULT_CLIENT_SECRET
  const url = process.env.VAULT_URL

  console.log('\n\nurl', url, '\n\n')
  const { data } = await axios.post(`${url}/import/private-key`, body, {
    headers: {
      'x-client-id': id,
      'x-client-secret': secret
    }
  })
  return data
}

export const saveEntities = async (entities: Entities, jwk: Jwk): Promise<EntityStore> => {
  const signature = await signData(entities, { jwk })

  const entity: EntityStore = {
    data: entities,
    signature
  }

  const entityUrl = process.env.ENTITY_URL as string
  const id = process.env.ENGINE_CLIENT_ID
  const secret = process.env.ENGINE_CLIENT_SECRET
  const engineUrl = process.env.ENGINE_URL
  const policyUrl = process.env.POLICY_URL as string

  try {
    const { data } = await axios.get<{ policy: PolicyStore; entity: EntityStore }>(policyUrl)

    await axios.post(entityUrl, { entity, policy: data.policy })
    await axios.post(`${engineUrl}/clients/sync`, null, {
      headers: {
        'x-client-id': id,
        'x-client-secret': secret
      }
    })

    return entity
  } catch (e) {
    console.error('Error in SaveEntities', e)
    throw e
  }
}

export const savePolicies = async (policies: Policy[], jwk: Jwk): Promise<PolicyStore> => {
  const store = {
    policy: {
      data: policies,
      signature: await signData(policies, { jwk })
    }
  }

  const id = process.env.ENGINE_CLIENT_ID
  const secret = process.env.ENGINE_CLIENT_SECRET
  const policyUrl = process.env.POLICY_URL as string
  const engineUrl = process.env.ENGINE_URL
  const entityUrl = process.env.ENTITY_URL as string

  const { data } = await axios.get<{ policy: PolicyStore; entity: EntityStore }>(entityUrl)

  await axios.put(policyUrl, { policy: store.policy, entity: data.entity })
  await axios.post(`${engineUrl}/clients/sync`, null, {
    headers: {
      'x-client-id': id,
      'x-client-secret': secret
    }
  })

  return store.policy
}

const signData = async (data: unknown, signConfig: SignConfig): Promise<JwtString> => {
  const iss = process.env.ARMORY_CLIENT_ID

  try {
    console.log('signConfig', signConfig)
    const hashed = hash(data)
    const payload = {
      data: hashed,
      sub: signConfig.jwk.kid,
      iss,
      iat: new Date().getTime()
    }

    const authentication = await signJwt(payload, signConfig.jwk)
    return authentication
  } catch (e) {
    console.error('Error in SignData', e)
    throw e
  }
}

const buildPayloadFromRequest = (request: Request, jwk: Jwk, orgId: string): Payload => {
  console.log('###request IN BUILD PAYLOAD', request)
  console.log('hash(request)', hash(request))
  return {
    requestHash: hash(request),
    sub: jwk.kid,
    iss: orgId,
    iat: new Date().getTime()
  }
}

const sign = async (request: Request, jwk: Jwk): Promise<EvaluationRequest> => {
  const id = process.env.ENGINE_CLIENT_ID as string

  const payload = buildPayloadFromRequest(request, jwk, id)
  const authentication = await signJwt(payload, jwk)

  return {
    authentication,
    request
  }
}

const evaluate = async (request: Request, jwk: Jwk): Promise<EvaluationResponse> => {
  const signedRequest = await sign(request, jwk)

  console.log('### signed request ', signedRequest)
  const engineUrl = process.env.ENGINE_URL
  const id = process.env.ENGINE_CLIENT_ID
  const secret = process.env.ENGINE_CLIENT_SECRET

  const url = `${engineUrl}${Endpoints.engine.evaluations}`
  console.log('url', url)

  const response = await axios.post(`${engineUrl}${Endpoints.engine.evaluations}`, signedRequest, {
    headers: {
      'x-client-id': id,
      'x-client-secret': secret
    }
  })

  console.log('###response', response.data)
  return response.data
}

export const resourceId = (address: Address): string => {
  return `eip155:eoa:${address}`
}

const vaultUrl = process.env.VAULT_URL

const vaultSignRequest = async (accessToken: AccessToken, request: Request, credential: Jwk): Promise<Hex> => {
  const detachedJws = await signAccountJwsd(request, accessToken.value, credential)

  console.log('###detachedJws', detachedJws)
  console.log('###accessToken', accessToken)
  const { data } = await axios.post(
    `${vaultUrl}/sign`,
    { request },
    {
      headers: {
        'x-client-id': process.env.VAULT_CLIENT_ID,
        'detached-jws': detachedJws,
        authorization: `GNAP ${accessToken.value}`
      }
    }
  )
  return data
}

export const createNarvalTransport = () => {
  return custom({
    type: 'http',
    name: 'narval-transport',
    request: async (args: NarvalRpcRequest): Promise<Hex | EntityStore | PolicyStore | AccessToken> => {
      switch (args.method) {
        case RpcMethod.Nar_SaveEntities: {
          const { entities, credential } = args.params
          const entityStore = await saveEntities(entities, credential)
          return entityStore
        }
        case RpcMethod.Nar_SavePolicies: {
          const { policies, credential } = args.params
          const policyStore = await savePolicies(policies, credential)
          return policyStore
        }
        case RpcMethod.EthSignTransaction: {
          const { request, accessToken, credential } = args.params
          const signature = await vaultSignRequest(accessToken, request, credential)
          return signature
        }
        case RpcMethod.Nar_EvaluateRequest: {
          const { request, credential } = args.params
          try {
            const res = await evaluate(request, credential)
            console.log('###engine res', res)
            if (res.accessToken && res.accessToken.value) {
              return res.accessToken
            }
          } catch (e) {
            throw new NarvalRpcError({
              message: 'Unauthorized',
              code: RpcErrorCode.Unauthorized,
              context: {
                method: args.method,
                params: args.params,
                engineError: e
              }
            })
          }
          throw new NarvalRpcError({
            message: 'Unauthorized',
            code: RpcErrorCode.Unauthorized,
            context: {
              method: args.method,
              params: args.params
            }
          })
        }
        // case RpcMethod.Nar_SignEvaluateAndSendTransaction: {
        //   const { request, jwk } = args.params;
        //   const res = await evaluate(request, jwk)
        //   if (res.accessToken && res.accessToken.value) {
        //     const signature = await vaultSignRequest(res.accessToken, request)
        //   }
        //   throw new NarvalRpcError({
        //     message: 'Unauthorized',
        //     code: RpcErrorCode.Unauthorized,
        //     context: {
        //       method: args.method,
        //       params: args.params
        //     }
        //   })
        // }
        default: {
          throw new NarvalRpcError({
            message: 'Unsupported method',
            code: RpcErrorCode.UnsupportedMethod,
            context: {
              method: args.method,
              params: args.params
            }
          })
        }
      }
    }
  })
}

export const createNarvalClient = ({ address, chain }: { address: Address; chain?: Chain }) => {
  try {
    const transport = createNarvalTransport()
    const client = createWalletClient({
      account: address,
      chain,
      transport,
      rpcSchema: NarvalRpcSchema
    }).extend((client) => ({
      async signTransaction({
        request,
        accessToken,
        credential
      }: {
        request: SignTransactionAction
        accessToken: AccessToken
        credential: Jwk
      }) {
        return client.request({
          method: RpcMethod.EthSignTransaction,
          params: {
            accessToken,
            request,
            credential
          }
        })
      },
      async evaluate({ request, credential }: { request: Request; credential: Jwk }): Promise<AccessToken> {
        return client.request({
          method: RpcMethod.Nar_EvaluateRequest,
          params: {
            request,
            credential
          }
        })
      },
      async signEvaluateAndSendTransaction({ request, jwk }: { request: Request; jwk: Jwk }) {
        return client.request({
          method: RpcMethod.Nar_SignEvaluateAndSendTransaction,
          params: {
            request,
            jwk
          }
        })
      },
      async saveEntities({ entities, credential }: { entities: Entities; credential: Jwk }) {
        console.log('###entities jwk:', credential)
        return client.request({
          method: RpcMethod.Nar_SaveEntities,
          params: {
            entities,
            credential
          }
        })
      },
      async savePolicies({ policies, credential }: { policies: Policy[]; credential: Jwk }) {
        return client.request({
          method: RpcMethod.Nar_SavePolicies,
          params: {
            policies,
            credential
          }
        })
      }
    }))
    return client
  } catch (e) {
    console.error(e)
    throw e
  }
}
