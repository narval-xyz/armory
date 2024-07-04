import { BlockdaemonTsmService } from '@narval-xyz/blockdaemon-tsm'
import { ConfigService } from '@narval/config-module'
import { LoggerService } from '@narval/nestjs-shared'
import { Alg, Hex, PublicKey, eip191Hash, hexToBase64Url, publicKeyToJwk } from '@narval/signature'
import { HttpStatus, Inject, Injectable } from '@nestjs/common'
import { toHex } from 'viem'
import { Config } from '../../../policy-engine.config'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { SignerConfig } from '../../../shared/type/domain.type'
import { SigningService } from './signing.service.interface'

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
  private url: string

  private apiKey: string

  private playerCount: number

  private blockdaemonService: BlockdaemonTsmService

  constructor(
    @Inject(ConfigService) private configService: ConfigService<Config>,
    blockdaemonService: BlockdaemonTsmService,
    private logger: LoggerService
  ) {
    const tsm = this.configService.get('tsm')

    if (!tsm) {
      throw new ApplicationException({
        message: 'TSM config not found',
        suggestedHttpStatusCode: 500
      })
    }

    this.blockdaemonService = blockdaemonService

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
    const sessionConfig = await this.blockdaemonService
      .getSessionConfig()
      .newStaticSessionConfig(sessionId, this.playerCount)

    const tsmClient = await this.createClient()

    const ecdsaKeyId = await tsmClient
      .ECDSA()
      .generateKey(sessionConfig, 1, this.blockdaemonService.getCurves().SECP256K1, keyId)
      .catch((e: Error) => wrapTsmException('Failed to generate ECDSA key', e))

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
      .catch((e: Error) => wrapTsmException('Failed to get public key from node', e))
    const publicKey = toHex(publicKeyBytes.slice(23))

    this.logger.log('Public key: ', publicKey)

    return {
      publicKey: publicKeyToJwk(publicKey, Alg.ES256K, ecdsaKeyId)
    }
  }

  private async createClient() {
    const config = await this.blockdaemonService.getConfiguration(this.url)
    await config.withAPIKeyAuthentication(this.apiKey)

    return this.blockdaemonService.getClient().withConfiguration(config)
  }

  buildSignerEip191(signer: SignerConfig, sessionId?: string) {
    return async (messageToSign: string): Promise<string> => {
      const hash = eip191Hash(messageToSign)
      if (!sessionId) {
        throw new ApplicationException({
          message: 'sessionId is missing',
          suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
        })
      }

      const sessionConfig = await this.blockdaemonService
        .getSessionConfig()
        .newStaticSessionConfig(sessionId, this.playerCount)

      const tsmClient = await this.createClient()

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
        .catch((e: Error) => wrapTsmException('Failed to sign message', e))

      const hexSignature: Hex = toHex(partialSig)

      return hexToBase64Url(hexSignature)
    }
  }
}
