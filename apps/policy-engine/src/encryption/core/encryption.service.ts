import {
  CommitmentPolicy,
  KmsKeyringNode,
  RawAesKeyringNode,
  RawAesWrappingSuiteIdentifier,
  buildClient
} from '@aws-crypto/client-node'
import { Inject, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import crypto from 'crypto'
import { Config } from '../../policy-engine.config'
import { EncryptionRepository } from '../persistence/repository/encryption.repository'

const keyNamespace = 'narval.armory.engine'
const commitmentPolicy = CommitmentPolicy.REQUIRE_ENCRYPT_REQUIRE_DECRYPT
const wrappingSuite = RawAesWrappingSuiteIdentifier.AES256_GCM_IV12_TAG16_NO_PADDING
const defaultEncryptionContext = {
  purpose: 'data-encryption',
  app: 'armory-engine'
}

const { encrypt, decrypt } = buildClient(commitmentPolicy)

@Injectable()
export class EncryptionService implements OnApplicationBootstrap {
  private logger = new Logger(EncryptionService.name)

  private configService: ConfigService<Config, true>

  private engineId: string

  private masterKey: Buffer | undefined

  private keyring: RawAesKeyringNode | KmsKeyringNode | undefined

  constructor(
    private encryptionRepository: EncryptionRepository,
    @Inject(ConfigService) configService: ConfigService<Config, true>
  ) {
    this.configService = configService
    this.engineId = configService.get('engine.id', { infer: true })
  }

  async onApplicationBootstrap(): Promise<void> {
    this.logger.log('Keyring Service boot')
    const keyringConfig = this.configService.get('keyring', { infer: true })

    // We have a Raw Keyring, so we are using a MasterPassword/KEK+MasterKey for encryption
    if (keyringConfig.masterPassword && !keyringConfig.masterAwsKmsArn) {
      const engine = await this.encryptionRepository.getEngine(this.engineId)
      let encryptedMasterKey = engine?.masterKey

      // Derive the Key Encryption Key (KEK) from the master password using PBKDF2
      const masterPassword = keyringConfig.masterPassword
      const kek = this.deriveKeyEncryptionKey(masterPassword)

      if (!encryptedMasterKey) {
        // No MK yet, so create it & encrypt w/ the KEK
        encryptedMasterKey = await this.generateMasterKey(kek)
      }

      const decryptedMasterKey = await this.decryptMasterKey(kek, Buffer.from(encryptedMasterKey, 'hex'))
      const isolatedMasterKey = Buffer.alloc(decryptedMasterKey.length)
      decryptedMasterKey.copy(isolatedMasterKey, 0, 0, decryptedMasterKey.length)

      /* Configure the Raw AES keyring. */
      const keyring = new RawAesKeyringNode({
        keyName: 'armory.engine.wrapping-key',
        keyNamespace,
        unencryptedMasterKey: isolatedMasterKey,
        wrappingSuite
      })

      this.keyring = keyring
    }
    // We have AWS KMS config so we'll use that instead as the MasterKey, which means we don't need a KEK separately
    else if (keyringConfig.masterAwsKmsArn && !keyringConfig.masterPassword) {
      const keyring = new KmsKeyringNode({ generatorKeyId: keyringConfig.masterAwsKmsArn })
      this.keyring = keyring
    } else {
      throw new Error('Invalid Keyring Configuration found')
    }
  }

  private getKeyEncryptionKeyring(kek: Buffer) {
    const keyring = new RawAesKeyringNode({
      keyName: 'armory.engine.kek',
      keyNamespace,
      unencryptedMasterKey: kek,
      wrappingSuite
    })

    return keyring
  }

  private deriveKeyEncryptionKey(password: string): Buffer {
    // Derive the Key Encryption Key (KEK) from the master password using PBKDF2
    const kek = crypto.pbkdf2Sync(password.normalize(), this.engineId.normalize(), 1000000, 32, 'sha256')
    return kek
  }

  private async encryptMaterKey(kek: Buffer, cleartext: Buffer): Promise<Buffer> {
    // Encrypt the Master Key (MK) with the Key Encryption Key (KEK)
    const keyring = this.getKeyEncryptionKeyring(kek)
    const { result } = await encrypt(keyring, cleartext, {
      encryptionContext: defaultEncryptionContext
    })

    return result
  }

  private async decryptMasterKey(kek: Buffer, ciphertext: Buffer): Promise<Buffer> {
    const keyring = this.getKeyEncryptionKeyring(kek)
    const { plaintext, messageHeader } = await decrypt(keyring, ciphertext)

    // Verify the context wasn't changed
    const { encryptionContext } = messageHeader

    Object.entries(defaultEncryptionContext).forEach(([key, value]) => {
      if (encryptionContext[key] !== value) throw new Error('Encryption Context does not match expected values')
    })

    return plaintext
  }

  async encrypt(cleartext: string | Buffer): Promise<Buffer> {
    const keyring = this.keyring
    if (!keyring) throw new Error('Keyring not set')

    const { result } = await encrypt(keyring, cleartext, {
      encryptionContext: defaultEncryptionContext
    })

    return result
  }

  async decrypt(ciphertext: Buffer): Promise<Buffer> {
    const keyring = this.keyring
    if (!keyring) throw new Error('Keyring not set')

    const { plaintext, messageHeader } = await decrypt(keyring, ciphertext)

    // Verify the context wasn't changed
    const { encryptionContext } = messageHeader

    Object.entries(defaultEncryptionContext).forEach(([key, value]) => {
      if (encryptionContext[key] !== value) throw new Error('Encryption Context does not match expected values')
    })

    return plaintext
  }

  private async generateMasterKey(kek: Buffer): Promise<string> {
    // Generate a new Master Key (MK) with AES256
    const mk = crypto.generateKeySync('aes', { length: 256 })
    const mkBuffer = mk.export()

    // Encrypt it with the Key Encryption Key (KEK) that was derived from the MP
    const encryptedMk = await this.encryptMaterKey(kek, mkBuffer)
    const encryptedMkString = encryptedMk.toString('hex')

    // Save the Result.
    const existingEngine = await this.encryptionRepository.getEngine(this.engineId)
    const engine = existingEngine
      ? await this.encryptionRepository.saveMasterKey(this.engineId, encryptedMkString)
      : await this.encryptionRepository.createEngine(this.engineId, encryptedMkString)

    if (!engine?.masterKey) {
      throw new Error('Master Key was not saved')
    }

    this.logger.log('Engine Master Key Setup Complete')
    return encryptedMkString
  }
}
