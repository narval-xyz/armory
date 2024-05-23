import { PrivateKey, PublicKey } from '@narval/signature'
import { SignerConfig } from '../../../shared/type/domain.type'

export interface SigningService {
  generateKey(keyId?: string): Promise<{
    publicKey: PublicKey
    privateKey?: PrivateKey
  }>

  buildSignerEip191(signer: SignerConfig): (msg: string) => Promise<string>

  // TODO: add other signer interfaces
}

export const SigningService = Symbol('SigningService')
