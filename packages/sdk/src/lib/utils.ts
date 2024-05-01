import { EvaluationRequest, JwtString, Request, isAddress } from '@narval/policy-engine-shared'
import {
  Jwk,
  JwsdHeader,
  Payload,
  SigningAlg,
  buildSignerEs256k,
  hash,
  hexToBase64Url,
  privateKeyToHex,
  signJwsd,
  signJwt
} from '@narval/signature'
import axios from 'axios'
import { Address, Hex, LocalAccount } from 'viem'
import { SignConfig } from './domain'

export type VaultAccount = LocalAccount & {
  jwk: Jwk
}

export const signAccountJwsd = async (payload: Payload, accessToken: string, jwk: Jwk, uri: string) => {
  if (!jwk.kid) {
    throw new Error('kid is required')
  }

  const privateKey = await privateKeyToHex(jwk)
  const signer = buildSignerEs256k(privateKey)

  const jwsdHeader: JwsdHeader = {
    alg: SigningAlg.ES256K,
    kid: jwk.kid,
    typ: 'gnap-binding-jwsd',
    htm: 'POST',
    uri,
    created: new Date().getTime(),
    ath: hexToBase64Url(hash(accessToken))
  }

  const signature = await signJwsd(payload, jwsdHeader, signer)
  return signature
}

export const resourceId = (walletIdOrAddress: Address | string): string => {
  if (isAddress(walletIdOrAddress)) {
    return `eip155:eoa:${walletIdOrAddress}`
  }
  return walletIdOrAddress
}

const buildPayloadFromRequest = (request: Request, jwk: Jwk, orgId: string): Payload => {
  return {
    requestHash: hash(request),
    sub: jwk.kid,
    iss: orgId,
    iat: new Date().getTime()
  }
}

export const signRequest = async (request: Request, jwk: Jwk, id: string): Promise<EvaluationRequest> => {
  const payload = buildPayloadFromRequest(request, jwk, id)
  const authentication = await signJwt(payload, jwk)

  return {
    authentication,
    request
  }
}

export const signData = async (data: unknown, signConfig: SignConfig, clientId: string): Promise<JwtString> => {
  const iss = clientId

  const hashed = hash(data)
  const payload = {
    data: hashed,
    sub: signConfig.jwk.kid,
    iss,
    iat: new Date().getTime()
  }
  const authentication = await signJwt(payload, signConfig.jwk)
  return authentication
}

export const importWallet = async (privateKey: Hex, walletId?: string): Promise<{ id: string; address: Address }> => {
  const body = {
    privateKey,
    walletId
  }
  const id = process.env.VAULT_CLIENT_ID
  const secret = process.env.VAULT_CLIENT_SECRET
  const url = process.env.VAULT_URL

  const { data } = await axios.post(`${url}/import/private-key`, body, {
    headers: {
      'x-client-id': id,
      'x-client-secret': secret
    }
  })
  return data
}
