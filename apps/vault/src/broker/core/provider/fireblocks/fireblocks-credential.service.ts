import { Alg, DEFAULT_RSA_MODULUS_LENGTH, generateJwk, getPublicKey, privateRsaPemToJwk } from '@narval/signature'
import { Injectable } from '@nestjs/common'
import { ParseException } from '../../../../shared/module/persistence/exception/parse.exception'
import { ConnectionInvalidPrivateKeyException } from '../../exception/connection-invalid-private-key.exception'
import { ProviderCredentialService } from '../../type/provider.type'
import { FireblocksCredentials, FireblocksInputCredentials } from './fireblocks.type'

@Injectable()
export class FireblocksCredentialService
  implements ProviderCredentialService<FireblocksInputCredentials, FireblocksCredentials>
{
  parse(value: unknown): FireblocksCredentials {
    const parse = FireblocksCredentials.safeParse(value)

    if (parse.success) {
      return parse.data
    }

    throw new ParseException(parse.error)
  }

  parseInput(value: unknown): FireblocksInputCredentials {
    const parse = FireblocksInputCredentials.safeParse(value)

    if (parse.success) {
      return parse.data
    }

    throw new ParseException(parse.error)
  }

  async build(input: FireblocksInputCredentials): Promise<FireblocksCredentials> {
    if (input.privateKey) {
      try {
        const pem = Buffer.from(input.privateKey, 'base64').toString('utf8')
        const privateKey = await privateRsaPemToJwk(pem)
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

  async generate<Options extends { modulusLength?: number } | undefined>(
    opts?: Options
  ): Promise<FireblocksCredentials> {
    const modulusLength = opts?.modulusLength || DEFAULT_RSA_MODULUS_LENGTH
    const privateKey = await generateJwk(Alg.RS256, { modulusLength })

    return {
      privateKey,
      publicKey: getPublicKey(privateKey)
    }
  }
}
