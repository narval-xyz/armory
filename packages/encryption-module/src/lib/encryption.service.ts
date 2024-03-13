import { Hex, toBytes } from '@narval/policy-engine-shared'
import { Inject, Injectable } from '@nestjs/common'
import { DEFAULT_ENCRYPTION_CONTEXT } from './encryption.constant'
import { MODULE_OPTIONS_TOKEN } from './encryption.module-definition'
import { EncryptionModuleOption } from './encryption.type'
import { getClient } from './encryption.util'

@Injectable()
export class EncryptionService {
  constructor(@Inject(MODULE_OPTIONS_TOKEN) private options: EncryptionModuleOption) {}

  async encrypt(value: string | Buffer | Uint8Array): Promise<Buffer> {
    const { encrypt } = getClient()
    const { result } = await encrypt(this.options.keyring, value, {
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
    const { plaintext, messageHeader } = await decrypt(this.options.keyring, ciphertextBuffer)

    // Verify the context wasn't changed.
    const { encryptionContext } = messageHeader
    Object.entries(DEFAULT_ENCRYPTION_CONTEXT).forEach(([key, value]) => {
      if (encryptionContext[key] !== value) {
        throw new Error('Encryption Context does not match expected values')
      }
    })

    return plaintext
  }
}
