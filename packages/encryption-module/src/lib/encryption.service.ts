import { Hex, toBytes } from '@narval/policy-engine-shared'
import { Inject, Injectable } from '@nestjs/common'
import { DEFAULT_ENCRYPTION_CONTEXT } from './encryption.constant'
import { EncryptionException } from './encryption.exception'
import { MODULE_OPTIONS_TOKEN } from './encryption.module-definition'
import { EncryptionModuleOption, Keyring } from './encryption.type'
import { getClient } from './encryption.util'

@Injectable()
export class EncryptionService {
  constructor(@Inject(MODULE_OPTIONS_TOKEN) private options: EncryptionModuleOption) {}

  async encrypt(value: string | Buffer | Uint8Array): Promise<Buffer> {
    const { encrypt } = getClient()
    const { result } = await encrypt(this.getKeyring(), value, {
      encryptionContext: DEFAULT_ENCRYPTION_CONTEXT
    })

    return result
  }

  async decrypt(ciphertext: Buffer | Uint8Array | Hex): Promise<Buffer> {
    let ciphertextBuffer = ciphertext
    if (typeof ciphertext === 'string') {
      ciphertextBuffer = toBytes(ciphertext)
    }

    const { decrypt } = getClient()
    const { plaintext, messageHeader } = await decrypt(this.getKeyring(), ciphertextBuffer)

    // Verify the context wasn't changed.
    const { encryptionContext } = messageHeader
    Object.entries(DEFAULT_ENCRYPTION_CONTEXT).forEach(([key, value]) => {
      if (encryptionContext[key] !== value) {
        throw new EncryptionException('Encryption context does not match expected values')
      }
    })

    return plaintext
  }

  getKeyring(): Keyring {
    if (this.options.keyring) {
      return this.options.keyring
    }

    throw new EncryptionException('Missing keyring. It seems the encryption module was not properly registered')
  }
}
