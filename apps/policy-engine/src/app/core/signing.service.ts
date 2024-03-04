import { JsonWebKey, toHex } from '@narval/policy-engine-shared'
import { Alg, Curves, KeyTypes, Use } from '@narval/signature'
import { Injectable } from '@nestjs/common'
import { secp256k1 } from '@noble/curves/secp256k1'
import { publicKeyToAddress } from 'viem/utils'
import { EncryptionService } from '../../encryption/core/encryption.service'

// Optional additional configs, such as for MPC-based DKG.
type KeyGenerationOptions = {
  keyId: string
}

type KeyGenerationResponse = {
  publicKey: JsonWebKey
  privateKey?: JsonWebKey
}

@Injectable()
export class SigningService {
  constructor(private encryptionService: EncryptionService) {}

  async generateSigningKey(alg: Alg, options?: KeyGenerationOptions): Promise<KeyGenerationResponse> {
    if (alg === Alg.ES256K) {
      const privateKey = toHex(secp256k1.utils.randomPrivateKey())
      const publicKey = toHex(secp256k1.getPublicKey(privateKey.slice(2), false))

      const publicJwk: JsonWebKey = {
        kty: KeyTypes.EC,
        crv: Curves.SECP256K1,
        alg: Alg.ES256K,
        use: Use.SIG,
        kid: options?.keyId || publicKeyToAddress(publicKey), // add an opaque prefix that indicates the key type
        x: publicKey.slice(2, 66),
        y: publicKey.slice(66)
      }

      const privateJwk: JsonWebKey = {
        ...publicJwk,
        d: privateKey.slice(2)
      }

      return {
        publicKey: publicJwk,
        privateKey: privateJwk
      }
    }

    throw new Error('Unsupported algorithm')
  }
}
