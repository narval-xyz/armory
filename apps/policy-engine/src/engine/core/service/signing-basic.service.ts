import {
  Alg,
  buildSignerEip191,
  privateKeyToHex,
  privateKeyToJwk,
  secp256k1PrivateKeyToPublicJwk
} from '@narval/signature'
import { Injectable, Logger } from '@nestjs/common'
import { generatePrivateKey } from 'viem/accounts'
import { SignerConfig } from '../../../shared/type/domain.type'
import { SigningService } from './signing.service.interface'

@Injectable()
export class SimpleSigningService implements SigningService {
  private logger = new Logger(SimpleSigningService.name)

  constructor() {}

  // TODO: test: that ensures KeyId is passed through
  async generateKey(keyId?: string) {
    const privateKey = privateKeyToJwk(generatePrivateKey(), Alg.ES256K, keyId)
    const hex = await privateKeyToHex(privateKey)
    const publicKey = secp256k1PrivateKeyToPublicJwk(hex, keyId)
    return {
      publicKey,
      privateKey
    }
  }

  buildSignerEip191(signer: SignerConfig) {
    return async (messageToSign: string): Promise<string> => {
      if (!signer.privateKey) throw new Error('Missing key in signer config')
      const privateKeyHex = await privateKeyToHex(signer.privateKey)
      const eip191Signer = buildSignerEip191(privateKeyHex)
      return eip191Signer(messageToSign)
    }
  }
}
