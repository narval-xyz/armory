import { ConfigService } from '@narval/config-module'
import { Alg, Hex, PublicKey, eip191Hash, hexToBase64Url, publicKeyToJwk } from '@narval/signature'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { Configuration, SessionConfig, TSMClient, curves } from '@sepior/tsmsdkv2'
import { toHex } from 'viem'
import { Config } from '../../../policy-engine.config'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { SignerConfig } from '../../../shared/type/domain.type'
import { SigningService } from './signing.service.interface'

const createClient = async (url: string, apiKey: string) => {
  const config = await new Configuration(url)
  await config.withAPIKeyAuthentication(apiKey)
  return await TSMClient.withConfiguration(config)
}

// util to wrap TSM SDK exceptions so we throw sanitized messages while capturing the internal error ourselves
const wrapTsmException = (message: string, e: Error) => {
  throw new ApplicationException({
    message,
    suggestedHttpStatusCode: 500,
    origin: e
  })
}

@Injectable()
export class MpcSigningService implements SigningService {
  private logger = new Logger(MpcSigningService.name)
  private url: string
  private apiKey: string
  private playerCount: number

  constructor(@Inject(ConfigService) private configService: ConfigService<Config>) {
    const tsm = this.configService.get('tsm')
    if (!tsm) {
      throw new ApplicationException({
        message: 'TSM config not found',
        suggestedHttpStatusCode: 500
      })
    }
    this.url = tsm.url
    this.apiKey = tsm.apiKey
    this.playerCount = tsm.playerCount
  }

  async generateKey(keyId?: string, sessionId?: string): Promise<{ publicKey: PublicKey }> {
    if (!sessionId) {
      throw new ApplicationException({
        message: 'sessionId is missing',
        suggestedHttpStatusCode: 500
      })
    }
    const sessionConfig = await SessionConfig.newStaticSessionConfig(sessionId, this.playerCount)

    const tsmClient = await createClient(this.url, this.apiKey)

    const ecdsaKeyId = await tsmClient
      .ECDSA()
      .generateKey(sessionConfig, 1, curves.SECP256K1, keyId)
      .catch((e) => wrapTsmException('Failed to generate ECDSA key', e))

    if (keyId && ecdsaKeyId !== keyId) {
      throw new ApplicationException({
        message: 'Generated KeyID does not match Desired KeyID',
        suggestedHttpStatusCode: 500
      })
    }

    this.logger.log('Generated ECDSA key with ID: ', ecdsaKeyId)

    // This is DER-encoded SPKI public key, so we need to slice off the DER header, which is 23 bytes for secp256k1
    const publicKeyBytes = await tsmClient
      .ECDSA()
      .publicKey(ecdsaKeyId)
      .catch((e) => wrapTsmException('Failed to get public key from node', e))
    const publicKey = toHex(publicKeyBytes.slice(23))

    this.logger.log('Public key: ', publicKey)

    return {
      publicKey: publicKeyToJwk(publicKey, Alg.ES256K, ecdsaKeyId)
    }
  }

  // Note: sessionId must be optional so we meet the SignerService interface requirement
  buildSignerEip191(signer: SignerConfig, sessionId?: string) {
    return async (messageToSign: string): Promise<string> => {
      const hash = eip191Hash(messageToSign)
      if (!sessionId) {
        throw new ApplicationException({
          message: 'sessionId is missing',
          suggestedHttpStatusCode: 500
        })
      }

      const sessionConfig = await SessionConfig.newStaticSessionConfig(sessionId, this.playerCount)

      const tsmClient = await createClient(this.url, this.apiKey)

      const keyId = signer.keyId || signer.publicKey?.kid
      if (!keyId) throw new Error('missing kid in buildSigner')

      const derivationPath = new Uint32Array()
      const partialSig = await tsmClient
        .ECDSA()
        .sign(sessionConfig, keyId, derivationPath, hash)
        .catch((e) => wrapTsmException('Failed to sign message', e))

      // // NOTE TSM returns a DER signature
      // const { signature, recoveryID } = await tsmClient0
      //   .ECDSA()
      //   .finalizeSignature(hash, partialSigs)
      // const sig = secp256k1.Signature.fromDER(signature)

      // const hexSignature: Hex = `0x${sig.toCompactHex()}${toHex(27n + BigInt(recoveryID)).slice(2)}`

      // const sig = secp256k1.Signature.fromDER(partialSigs[0])
      const hexSignature: Hex = toHex(partialSig)

      // const signature = signSecp256k1(hash, privateKey, true)
      this.logger.log(hexSignature)

      return hexToBase64Url(hexSignature)
    }
  }
}
