import { RawAesKeyringNode } from '@aws-crypto/client-node'
import { DEFAULT_WRAPPING_SUITE, generateKeyEncryptionKey } from '@narval/encryption-module'

export const getTestRawAesKeyring = (options?: { password: string; salt: string }) => {
  const password = options?.password || 'test-encryption-password'
  const salt = options?.salt || 'test-encryption-salt'

  return new RawAesKeyringNode({
    keyName: 'test.key.name',
    keyNamespace: 'test.key.namespace',
    unencryptedMasterKey: generateKeyEncryptionKey(password, salt),
    wrappingSuite: DEFAULT_WRAPPING_SUITE
  })
}
