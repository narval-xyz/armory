import { CommitmentPolicy, RawAesKeyringNode, buildClient as buildAwsClient } from '@aws-crypto/client-node'
import { toHex } from '@narval/policy-engine-shared'
import { generateKeySync, pbkdf2Sync } from 'crypto'
import { DEFAULT_ENCRYPTION_CONTEXT, DEFAULT_KEY_NAMESPACE, DEFAULT_WRAPPING_SUITE } from './encryption.constant'

export const isolateBuffer = (buffer: Buffer): Buffer => {
  const newBuffer = Buffer.alloc(buffer.length)
  buffer.copy(newBuffer, 0, 0, buffer.length)

  return newBuffer
}

export const generateKeyEncryptionKey = (
  password: string,
  salt: string,
  options?: { iterations?: number; length: number }
): Buffer => {
  const iterations = options?.length || 1_000_000
  const length = options?.length || 32

  const kek = pbkdf2Sync(password.normalize(), salt.normalize(), iterations, length, 'sha256')

  return kek
}

const buildKeyEncryptionKeyring = (kek: Buffer) => {
  return new RawAesKeyringNode({
    keyName: 'armory.engine.kek',
    unencryptedMasterKey: isolateBuffer(kek),
    keyNamespace: DEFAULT_KEY_NAMESPACE,
    wrappingSuite: DEFAULT_WRAPPING_SUITE
  })
}

export const getClient = () => {
  return buildAwsClient(CommitmentPolicy.REQUIRE_ENCRYPT_REQUIRE_DECRYPT)
}

export const encryptMaterKey = async (kek: Buffer, cleartext: Buffer): Promise<Buffer> => {
  // Encrypt the Master Key with the Key Encryption Key.
  const keyring = buildKeyEncryptionKeyring(kek)
  const { result } = await getClient().encrypt(keyring, cleartext, {
    encryptionContext: DEFAULT_ENCRYPTION_CONTEXT
  })

  return result
}

export const decryptMasterKey = async (kek: Buffer, ciphertext: Uint8Array): Promise<Buffer> => {
  const keyring = buildKeyEncryptionKeyring(kek)
  const { plaintext, messageHeader } = await getClient().decrypt(keyring, ciphertext)
  const { encryptionContext } = messageHeader

  // Verify the context wasn't changed.
  Object.entries(DEFAULT_ENCRYPTION_CONTEXT).forEach(([key, value]) => {
    if (encryptionContext[key] !== value) {
      throw new Error('Encryption Context does not match expected values')
    }
  })

  return plaintext
}

export const generateMasterKey = async (kek: Buffer): Promise<string> => {
  const mk = generateKeySync('aes', { length: 256 })
  const mkBuffer = mk.export()

  // Encrypt it with the Key Encryption Key (KEK) that was derived from
  // the a password and salt.
  const encryptedMk = await encryptMaterKey(kek, mkBuffer)
  const encryptedMkString = toHex(encryptedMk)

  return encryptedMkString
}
