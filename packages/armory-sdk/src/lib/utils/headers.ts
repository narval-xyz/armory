import {
  JwtString,
} from '@narval/policy-engine-shared'
import { JwsdHeader, buildSignerForAlg, hash, hexToBase64Url, signJwsd } from '@narval/signature'
import { DETACHED_JWS, HEADER_CLIENT_ID, HEADER_CLIENT_SECRET } from '../constants'
import { EngineClientConfig, JwsdHeaderArgs, SignAccountJwsdArgs } from '../domain'
import { NarvalSdkException } from '../exceptions'
import { BasicHeaders, GnapHeaders } from '../schema'

export const signAccountJwsd = async (args: SignAccountJwsdArgs) => {
  const { payload, accessToken, jwk, uri, htm } = args

  let signer = args.signer
  let alg = args.alg

  if (!signer) {
    signer = await buildSignerForAlg(jwk)
    alg = jwk.alg
  }

  const jwsdHeader = buildJwsdHeader({ accessToken, jwk, alg, uri, htm })

  return signJwsd(payload, jwsdHeader, signer).then((jws) => {
    const parts = jws.split('.')
    parts[1] = ''
    return parts.join('.')
  })
}

export const buildJwsdHeader = (args: JwsdHeaderArgs): JwsdHeader => {
  const { uri, htm, jwk, alg, accessToken } = args

  if (!jwk.kid || !alg) {
    throw new NarvalSdkException('kid and alg are required', {
      context: {
        kid: jwk.kid,
        alg,
        args
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


export const buildBasicEngineHeaders = (config: EngineClientConfig): BasicHeaders => {
  return {
    [HEADER_CLIENT_ID]: config.authClientId,
    [HEADER_CLIENT_SECRET]: config.authSecret
  }
}

export const buildGnapVaultHeaders = (
  vaultClientId: string,
  accessToken: JwtString,
  detachedJws: string
): GnapHeaders => {
  return {
    [HEADER_CLIENT_ID]: vaultClientId,
    [DETACHED_JWS]: detachedJws,
    authorization: `GNAP ${accessToken}`
  }
}
