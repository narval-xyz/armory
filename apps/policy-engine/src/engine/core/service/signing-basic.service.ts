import {
  Alg,
  buildSignerEip191,
  privateKeyToHex,
  privateKeyToJwk,
  secp256k1PrivateKeyToPublicJwk
} from '@narval/signature'
import { HttpStatus, Injectable } from '@nestjs/common'
import { generatePrivateKey } from 'viem/accounts'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { SignerConfig } from '../../../shared/type/domain.type'
import { SigningService } from './signing.service.interface'

@Injectable()
export class SimpleSigningService implements SigningService {
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
      if (!signer.privateKey)
        throw new ApplicationException({
          message: 'Missing key in signer config',
          suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
        })
      const privateKeyHex = await privateKeyToHex(signer.privateKey)
      const eip191Signer = buildSignerEip191(privateKeyHex)
      return eip191Signer(messageToSign)
    }
  }
}
