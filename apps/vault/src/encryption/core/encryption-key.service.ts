import { Alg, RsaPrivateKey, RsaPublicKey, generateJwk, rsaPrivateKeyToPublicKey } from '@narval/signature'
import { Injectable } from '@nestjs/common'

const DEFAULT_RSA_MODULUS_LENGTH = 4096

@Injectable()
export class EncryptionKeyService {
  async generate(clientId: string, opts?: { modulusLenght?: number }): Promise<RsaPublicKey> {
    const modulusLength = opts?.modulusLenght || DEFAULT_RSA_MODULUS_LENGTH

    const privateKey = await generateJwk<RsaPrivateKey>(Alg.RS256, { use: 'enc', modulusLength })
    const publicKey = rsaPrivateKeyToPublicKey(privateKey)

    return publicKey
  }

  decrypt(clientId: string, data: string): Promise<string> {}
}
