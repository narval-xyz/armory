import { toHex } from '@narval/policy-engine-shared'
import {
  Alg,
  Payload,
  PrivateKey,
  PublicKey,
  SigningAlg,
  buildSignerEip191,
  buildSignerEs256k,
  secp256k1PrivateKeyToJwk,
  signJwt
} from '@narval/signature'
import { Injectable } from '@nestjs/common'
import { secp256k1 } from '@noble/curves/secp256k1'

// Optional additional configs, such as for MPC-based DKG.
type KeyGenerationOptions = {
  keyId: string
}

type KeyGenerationResponse = {
  publicKey: PublicKey
  privateKey?: PrivateKey
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
      const privateJwk = secp256k1PrivateKeyToJwk(privateKey, options?.keyId)

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

  async sign(payload: Payload, jwk: PrivateKey, opts: SignOptions = {}): Promise<string> {
    const alg: SigningAlg = opts.alg || jwk.alg
    if (alg === SigningAlg.ES256K) {
      const pk = jwk.d
      const jwt = await signJwt(payload, jwk, opts, buildSignerEs256k(pk))

      return jwt
    } else if (alg === SigningAlg.EIP191) {
      const pk = jwk.d

      const jwt = await signJwt(payload, jwk, opts, buildSignerEip191(pk))

      return jwt
    }

    throw new Error('Unsupported algorithm')
  }
}
