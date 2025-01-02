import { AccessToken } from '@narval/policy-engine-shared'
import { Jwk, JwsdHeader, SigningAlg, hash, hexToBase64Url, signJwsd } from '@narval/signature'
import assert from 'assert'
import { InternalAxiosRequestConfig } from 'axios'
import { ArmorySdkException } from '../exceptions'
import { Signer } from './type'

export const REQUEST_HEADER_DETACHED_JWS = 'detached-jws'

export const Htm = {
  POST: 'POST',
  GET: 'GET',
  PUT: 'PUT'
} as const
export type Htm = (typeof Htm)[keyof typeof Htm]

type BuildJwsdHeader = {
  uri: string
  htm: Htm
  jwk: Jwk
  alg?: SigningAlg
  accessToken?: AccessToken
}

const buildJwsdHeader = (args: BuildJwsdHeader): JwsdHeader => {
  const { uri, htm, jwk, alg, accessToken } = args

  if (!jwk.kid || !alg) {
    throw new ArmorySdkException('kid and alg are required', {
      context: {
        kid: jwk.kid,
        alg,
        args: args
      }
    })
  }
  const now = Math.floor(Date.now() / 1000) // Now in seconds

  return {
    alg,
    kid: jwk.kid,
    typ: 'gnap-binding-jwsd',
    htm,
    uri,
    created: now,
    ath: accessToken ? hexToBase64Url(hash(accessToken.value)) : undefined
  }
}

export type GetJwsdProof = {
  payload: string | object // Request body
  accessToken: AccessToken | undefined
  uri: string
  htm: Htm
  signer: Signer
}

export const getJwsdProof = async (args: GetJwsdProof): Promise<string> => {
  const { payload, accessToken, uri, htm, signer } = args
  const { jwk, alg } = signer
  const jwsdHeader = buildJwsdHeader({ accessToken, jwk, alg, uri, htm })

  const jws = await signJwsd(payload, jwsdHeader, signer.sign)

  const parts = jws.split('.')
  parts[1] = ''

  return parts.join('.')
}

export const prefixGnapToken = ({ value }: AccessToken): string => `GNAP ${value}`

export const parseToken = (value: string): string => value.trim().replace(/^(GNAP|bearer)\s+/i, '')

const getHtm = (method: string): Htm => {
  switch (method.toLowerCase()) {
    case 'post':
      return Htm.POST
    case 'get':
      return Htm.GET
    case 'put':
      return Htm.PUT
    default:
      throw new ArmorySdkException('Unsupported HTTP method', { method })
  }
}

export const interceptRequestAddDetachedJwsHeader =
  (signer: Signer) =>
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    assert(config.url !== undefined, 'Missing request URL')
    assert(config.method !== undefined, 'Missing request method')

    const authorizationHeader = config.headers['Authorization'] || config.headers['authorization']

    const token = authorizationHeader ? parseToken(authorizationHeader) : undefined
    const htm = getHtm(config.method)
    const payload = config.data ? JSON.parse(config.data) : {}

    const signature = await getJwsdProof({
      accessToken: token ? { value: token } : undefined,
      htm,
      payload,
      signer: signer,
      uri: config.url
    })

    config.headers[REQUEST_HEADER_DETACHED_JWS] = signature

    return config
  }
