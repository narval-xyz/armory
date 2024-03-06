import { JsonWebKey, toHex } from '@narval/policy-engine-shared'
import { Alg, Payload, SigningAlg, privateKeyToJwk } from '@narval/signature'
import { Injectable } from '@nestjs/common'
import { secp256k1 } from '@noble/curves/secp256k1'
import { buildSignerEip191, buildSignerEs256k, signJwt } from 'packages/signature/src/lib/sign'

// Optional additional configs, such as for MPC-based DKG.
type KeyGenerationOptions = {
  keyId: string
}

type KeyGenerationResponse = {
  publicKey: JsonWebKey
  privateKey?: JsonWebKey
}

type SignOptions = {
  alg?: SigningAlg
}

@Injectable()
export class SigningService {
  constructor() {}

  async generateSigningKey(alg: Alg, options?: KeyGenerationOptions): Promise<KeyGenerationResponse> {
    if (alg === Alg.ES256K) {
      const privateKey = toHex(secp256k1.utils.randomPrivateKey())
      const privateJwk = privateKeyToJwk(privateKey, options?.keyId)

      // Remove the privateKey from the public jwk
      const publicJwk = {
        ...privateJwk,
        d: undefined
      }

      return {
        publicKey: publicJwk,
        privateKey: privateJwk
      }
    }

    throw new Error('Unsupported algorithm')
  }

  async sign(payload: Payload, jwk: JsonWebKey, opts: SignOptions = {}): Promise<string> {
    const alg: SigningAlg = opts.alg || jwk.alg
    if (alg === SigningAlg.ES256K) {
      if (!jwk.d) {
        throw new Error('Missing private key')
      }
      const pk = jwk.d

      const jwt = await signJwt(payload, jwk, opts, buildSignerEs256k(pk))

      return jwt
    } else if (alg === SigningAlg.EIP191) {
      if (!jwk.d) {
        throw new Error('Missing private key')
      }
      const pk = jwk.d

      const jwt = await signJwt(payload, jwk, opts, buildSignerEip191(pk))

      return jwt
    }

    throw new Error('Unsupported algorithm')
  }
}
