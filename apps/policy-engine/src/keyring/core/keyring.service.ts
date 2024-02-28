import { Inject, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import crypto from 'crypto'
import { Config } from '../../policy-engine.config'
import { KeyringRepository } from '../persistence/repository/keyring.repository'

const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16

@Injectable()
export class KeyringService implements OnApplicationBootstrap {
  private logger = new Logger(KeyringService.name)

  private engineId: string

  private kek: Buffer

  private masterPassword: string

  private masterKey: Buffer

  private adminApiKey: Buffer

  constructor(
    private keyringRepository: KeyringRepository,
    @Inject(ConfigService) configService: ConfigService<Config, true>
  ) {
    this.engineId = configService.get('engine.id', { infer: true })
    this.masterPassword = configService.get('engine.masterPassword', { infer: true })
  }

  async onApplicationBootstrap(): Promise<void> {
    this.logger.log('Keyring Service boot')
    let engine = await this.keyringRepository.getEngine(this.engineId)

    // Derive the Key Encryption Key (KEK) from the master password using PBKDF2
    this.kek = this.deriveKeyEncryptionKey(this.masterPassword)

    if (!engine) {
      // New Engine, set it up
      engine = await this.firstTimeSetup()
    }

    this.masterKey = this.decryptWithKey(this.kek, engine.masterKey)
    this.adminApiKey = this.decryptWithKey(this.kek, engine.adminApiKey)
  }

  private deriveKeyEncryptionKey(password: string): Buffer {
    // Derive the Key Encryption Key (KEK) from the master password using PBKDF2
    const kek = crypto.pbkdf2Sync(password.normalize(), this.engineId.normalize(), 1000000, 32, 'sha256')
    this.logger.log('Derived KEK', { kek: kek.toString('hex') }) // TODO: Sanitize
    return kek
  }

  decryptWithKey(key: Buffer, encryptedString: string): Buffer {
    const encryptedBuffer = Buffer.from(encryptedString, 'hex')
    // IV and AuthTag are prepend/appended, so slice them off
    const iv = encryptedBuffer.subarray(0, IV_LENGTH)
    const authTag = encryptedBuffer.subarray(encryptedBuffer.length - AUTH_TAG_LENGTH)
    const encrypted = encryptedBuffer.subarray(IV_LENGTH, encryptedBuffer.length - AUTH_TAG_LENGTH)

    // Decrypt the data with the key
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv, { authTagLength: AUTH_TAG_LENGTH })
    decipher.setAuthTag(authTag)
    let decrypted = decipher.update(encrypted)
    decrypted = Buffer.concat([decrypted, decipher.final()])

    return decrypted
  }

  encryptWithKey(key: Buffer, data: Buffer): string {
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv, { authTagLength: AUTH_TAG_LENGTH })
    let encrypted = cipher.update(data)
    encrypted = Buffer.concat([encrypted, cipher.final()])
    const authTag = cipher.getAuthTag()
    // Concatenate the IV, encrypted key, and auth tag since those are not-secret and needed for decryption
    const result = Buffer.concat([iv, encrypted, authTag])
    return result.toString('hex')
  }

  private async firstTimeSetup() {
    // Generate a new Master Key (MK) with AES256
    const mk = crypto.generateKeySync('aes', { length: 256 })
    const mkBuffer = mk.export()

    // Generate an Admin API Key, just a random 32-byte string
    const adminApiKeyBuffer = crypto.randomBytes(32)

    // Encrypt the Master Key (MK) with the Key Encryption Key (KEK)
    const encryptedMk = this.encryptWithKey(this.kek, mkBuffer)
    const encryptedApiKey = this.encryptWithKey(this.kek, adminApiKeyBuffer)

    // Save the Result.
    const engine = await this.keyringRepository.createEngine(this.engineId, encryptedMk, encryptedApiKey)

    this.logger.log('Engine Initial Setup Complete')
    // TODO: Print this to a console in a better way; may not even like this.
    this.logger.log('Admin API Key -- DO NOT LOSE THIS', adminApiKeyBuffer.toString('hex'))
    return engine
  }

  // Verify if a given string matches our internal Admin Api Key
  verifyAdminApiKey(apiKey: string): boolean {
    return apiKey === this.adminApiKey.toString('hex')
  }

  deriveContentEncryptionKey(keyId: string) {
    // Derive a CEK from the MK+keyId using HKDF
    const cek = crypto.hkdfSync('sha256', this.masterKey, keyId, 'content', 32)
    this.logger.log('Derived KEK', { cek: Buffer.from(cek).toString('hex') }) // TODO: Sanitize
    return Buffer.from(cek)
  }
}
