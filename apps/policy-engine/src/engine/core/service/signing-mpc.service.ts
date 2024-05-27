/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires, @nx/enforce-module-boundaries */
import { ConfigService } from '@narval/config-module'
import { Alg, Hex, PublicKey, eip191Hash, hexToBase64Url, publicKeyToJwk } from '@narval/signature'
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { toHex } from 'viem'
import { Config } from '../../../policy-engine.config'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { SignerConfig } from '../../../shared/type/domain.type'
import { SigningService } from './signing.service.interface'

let Configuration: any
let SessionConfig: any
let TSMClient: any
const curves = {
  SECP256K1: 'secp256k1',
  ED448: 'ED-448',
  ED25519: 'ED-25519'
}

// TODO: this should be moved into the try-catch but it's breaking nx lint rules so temporarily moving it up.
const tsmsdkv2 = require('@sepior/tsmsdkv2')
try {
  TSMClient = tsmsdkv2.TSMClient
  Configuration = tsmsdkv2.Configuration
  SessionConfig = tsmsdkv2.SessionConfig
} catch (err) {
  // eslint-disable-next-line no-console
  console.log('@sepior/tsmsdkv2 is not installed')
}

const createClient = async (url: string, apiKey: string) => {
  if (!TSMClient || !Configuration) return null

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
    if (!sessionId || !SessionConfig || !TSMClient) {
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
      .catch((e: any) => wrapTsmException('Failed to generate ECDSA key', e))

    if (keyId && ecdsaKeyId !== keyId) {
      throw new ApplicationException({
        message: 'Generated KeyID does not match Desired KeyID',
        suggestedHttpStatusCode: 500
      })
    }

    this.logger.log('Generated ECDSA key with ID: ', { keyId: ecdsaKeyId })

    // This is DER-encoded SPKI public key, so we need to slice off the DER header, which is 23 bytes for secp256k1
    const publicKeyBytes = await tsmClient
      .ECDSA()
      .publicKey(ecdsaKeyId)
      .catch((e: any) => wrapTsmException('Failed to get public key from node', e))
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
          suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
        })
      }

      const sessionConfig = await SessionConfig.newStaticSessionConfig(sessionId, this.playerCount)

      const tsmClient = await createClient(this.url, this.apiKey)

      const keyId = signer.keyId || signer.publicKey?.kid
      if (!keyId) {
        throw new ApplicationException({
          message: 'missing kid in buildSigner',
          suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
        })
      }

      const derivationPath = new Uint32Array()
      const partialSig = await tsmClient
        .ECDSA()
        .sign(sessionConfig, keyId, derivationPath, hash)
        .catch((e: any) => wrapTsmException('Failed to sign message', e))

      const hexSignature: Hex = toHex(partialSig)

      return hexToBase64Url(hexSignature)
    }
  }
}
