import { JwtString } from '@narval/policy-engine-shared'
import { Payload, hash, signJwt } from '@narval/signature'
import { Signer } from '../shared/type'

export const buildPayload = (
  data: unknown,
  opts: {
    iss?: string
    sub?: string
    iat?: Date
  } = {}
): Payload => {
  return {
    data: hash(data),
    sub: opts.sub,
    iss: opts.iss,
    iat: opts.iat?.getTime() || new Date().getTime()
  }
}

export const sign = (opts: {
  data: unknown
  signer: Signer
  clientId: string
  issuedAt?: Date
}): Promise<JwtString> => {
  const { data, clientId, signer, issuedAt } = opts

  return signJwt(
    buildPayload(data, {
      sub: signer.jwk.kid,
      iss: clientId,
      iat: issuedAt
    }),
    signer.jwk,
    { alg: signer.alg },
    signer.sign
  )
}
