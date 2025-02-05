import { Alg, generateJwk, getPublicKey, privateKeyToJwk } from '@narval/signature'
import { Injectable } from '@nestjs/common'
import { ParseException } from '../../../../shared/module/persistence/exception/parse.exception'
import { ConnectionInvalidPrivateKeyException } from '../../exception/connection-invalid-private-key.exception'
import { ProviderCredentialService } from '../../type/provider.type'
import { AnchorageCredentials, AnchorageInputCredentials } from './anchorage.type'

@Injectable()
export class AnchorageCredentialService
  implements ProviderCredentialService<AnchorageInputCredentials, AnchorageCredentials>
{
  static SIGNING_KEY_ALG = Alg.EDDSA

  parse(value: unknown): AnchorageCredentials {
    const parse = AnchorageCredentials.safeParse(value)

    if (parse.success) {
      return parse.data
    }

    throw new ParseException(parse.error)
  }

  parseInput(value: unknown): AnchorageInputCredentials {
    const parse = AnchorageInputCredentials.safeParse(value)

    if (parse.success) {
      return parse.data
    }

    throw new ParseException(parse.error)
  }

  async build(input: AnchorageInputCredentials): Promise<AnchorageCredentials> {
    if (input.privateKey) {
      try {
        const privateKey = privateKeyToJwk(input.privateKey, Alg.EDDSA)
        const publicKey = getPublicKey(privateKey)

        return {
          apiKey: input.apiKey,
          privateKey,
          publicKey
        }
      } catch (error) {
        throw new ConnectionInvalidPrivateKeyException({
          message: error.message,
          origin: error
        })
      }
    }

    throw new ConnectionInvalidPrivateKeyException()
  }

  async generate(): Promise<AnchorageCredentials> {
    const privateKey = await generateJwk(Alg.EDDSA)

    return {
      privateKey,
      publicKey: getPublicKey(privateKey)
    }
  }
}
