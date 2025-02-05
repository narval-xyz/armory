import { Injectable } from '@nestjs/common'
import { ParseException } from '../../../../shared/module/persistence/exception/parse.exception'
import { ConnectionInvalidCredentialsException } from '../../exception/connection-invalid-credentials.exception'
import { ProviderCredentialService } from '../../type/provider.type'
import { BitgoCredentials, BitgoInputCredentials } from './bitgo.type'

@Injectable()
export class BitgoCredentialService implements ProviderCredentialService<BitgoInputCredentials, BitgoCredentials> {
  parse(value: unknown): BitgoCredentials {
    const parse = BitgoCredentials.safeParse(value)

    if (parse.success) {
      return parse.data
    }

    throw new ParseException(parse.error)
  }

  parseInput(value: unknown): BitgoInputCredentials {
    const parse = BitgoInputCredentials.safeParse(value)

    if (parse.success) {
      return parse.data
    }

    throw new ParseException(parse.error)
  }

  async build(input: BitgoInputCredentials): Promise<BitgoCredentials> {
    if (input.apiKey) {
      return {
        apiKey: input.apiKey,
        walletPassphrase: input.walletPassphrase
      }
    }

    throw new ConnectionInvalidCredentialsException()
  }

  async generate(): Promise<BitgoCredentials> {
    // noop, you can't generate bitgo credentials
    return {}
  }
}
