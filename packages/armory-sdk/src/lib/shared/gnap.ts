import { AccessToken } from '@narval/policy-engine-shared'
import { Jwk, JwsdHeader, Payload, SigningAlg, hash, hexToBase64Url, signJwsd } from '@narval/signature'
import { ArmorySdkException } from '../exceptions'
import { Signer } from './type'

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
  accessToken: AccessToken
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

  return {
    alg,
    kid: jwk.kid,
    typ: 'gnap-binding-jwsd',
    htm,
    uri,
    created: new Date().getTime(),
    ath: hexToBase64Url(hash(accessToken.value))
  }
}

export type GetJwsdProof = {
  payload: Payload
  accessToken: AccessToken
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

export const getBearerToken = ({ value }: AccessToken): string => `GNAP ${value}`
