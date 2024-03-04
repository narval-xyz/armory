import { toHex } from '@narval/policy-engine-shared'
import { Alg } from '@narval/signature'
import { Injectable } from '@nestjs/common'
import { secp256k1 } from '@noble/curves/secp256k1'
import { EncryptionService } from '../../encryption/core/encryption.service'

// Optional additional configs, such as for MPC-based DKG.
type KeyGenerationOptions = {
  keyId: string
}

type KeyGenerationResponse = {
  publicKey: string
  encryptedPrivateKey?: string
  keyId?: string
}

@Injectable()
export class SigningService {
  constructor(private encryptionService: EncryptionService) {}

  async generateSigningKey(alg: Alg, options?: KeyGenerationOptions): Promise<KeyGenerationResponse> {
    if (alg === Alg.ES256K) {
      const privateKey = toHex(secp256k1.utils.randomPrivateKey())
      const publicKey = toHex(secp256k1.getPublicKey(privateKey.slice(2), false))

      const encryptedPrivateKey = await this.encryptionService.encrypt(privateKey)
      const encryptedPrivateKeyHex = toHex(encryptedPrivateKey)

      return {
        publicKey,
        encryptedPrivateKey: encryptedPrivateKeyHex
      }
    }

    throw new Error('Unsupported algorithm')
  }
}
