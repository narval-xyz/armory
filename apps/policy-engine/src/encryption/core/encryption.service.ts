import {
  CommitmentPolicy,
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

  private adminApiKey: Buffer | undefined

  constructor(
    private encryptionRepository: EncryptionRepository,
    @Inject(ConfigService) configService: ConfigService<Config, true>
  ) {
    this.configService = configService
    this.engineId = configService.get('engine.id', { infer: true })
  }

  async onApplicationBootstrap(): Promise<void> {
    this.logger.log('Keyring Service boot')
    let engine = await this.encryptionRepository.getEngine(this.engineId)

    // Derive the Key Encryption Key (KEK) from the master password using PBKDF2
    const masterPassword = this.configService.get('engine.masterPassword', { infer: true })
    const kek = this.deriveKeyEncryptionKey(masterPassword)

    if (!engine) {
      // New Engine, set it up
      engine = await this.firstTimeSetup(kek)
    }

    const decryptedMasterKey = await this.decryptMasterKey(kek, Buffer.from(engine.masterKey, 'hex'))
    this.masterKey = Buffer.alloc(decryptedMasterKey.length)
    decryptedMasterKey.copy(decryptedMasterKey, 0, 0, decryptedMasterKey.length)

    this.adminApiKey = Buffer.from(engine.adminApiKey, 'hex')
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

  private async getKeyring() {
    if (!this.masterKey) throw new Error('Master Key not set')

    /* Configure the Raw AES keyring. */
    const keyring = new RawAesKeyringNode({
      keyName: 'armory.engine.wrapping-key',
      keyNamespace,
      unencryptedMasterKey: this.masterKey,
      wrappingSuite
    })

    // TODO: also support KMS keyring

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
    const keyring = await this.getKeyring()

    const { result } = await encrypt(keyring, cleartext, {
      encryptionContext: defaultEncryptionContext
    })

    return result
  }

  async decrypt(ciphertext: Buffer): Promise<Buffer> {
    const keyring = await this.getKeyring()

    const { plaintext, messageHeader } = await decrypt(keyring, ciphertext)

    // Verify the context wasn't changed
    const { encryptionContext } = messageHeader

    Object.entries(defaultEncryptionContext).forEach(([key, value]) => {
      if (encryptionContext[key] !== value) throw new Error('Encryption Context does not match expected values')
    })

    return plaintext
  }

  private async firstTimeSetup(kek: Buffer) {
    // Generate a new Master Key (MK) with AES256
    const mk = crypto.generateKeySync('aes', { length: 256 })
    const mkBuffer = mk.export()

    const encryptedMk = await this.encryptMaterKey(kek, mkBuffer)

    // Generate an Admin API Key, just a random 32-byte string
    const adminApiKeyBuffer = crypto.randomBytes(32)

    // Save the Result.
    const engine = await this.encryptionRepository.createEngine(
      this.engineId,
      encryptedMk.toString('hex'),
      adminApiKeyBuffer.toString('hex') // TODO: this isn't encrypted, it should be encrypted with a CEK not with KEK
    )

    this.logger.log('Engine Initial Setup Complete')
    // TODO: Print this to a console in a better way; may not even like this.
    this.logger.log('Admin API Key -- DO NOT LOSE THIS', adminApiKeyBuffer.toString('hex'))
    return engine
  }

  // Verify if a given string matches our internal Admin Api Key
  verifyAdminApiKey(apiKey: string): boolean {
    return apiKey === this.adminApiKey?.toString('hex')
  }
}
