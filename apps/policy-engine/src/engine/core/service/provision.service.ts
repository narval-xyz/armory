import { ConfigService } from '@narval/config-module'
import { decryptMasterKey, generateKeyEncryptionKey, generateMasterKey } from '@narval/encryption-module'
import { LoggerService } from '@narval/nestjs-shared'
import { toBytes } from '@narval/policy-engine-shared'
import { Injectable } from '@nestjs/common'
import { Config } from '../../../policy-engine.config'
import { Engine } from '../../../shared/type/domain.type'
import { ProvisionException } from '../exception/provision.exception'
import { EngineService } from './engine.service'

@Injectable()
export class ProvisionService {
  // IMPORTANT: The provision service establishes encryption. Therefore, you
  // cannot have dependencies that rely on encryption to function. If you do,
  // you'll ran into an error due to a missing keyring.
  // Any process that requires encryption should be handled in the
  // BootstrapService.
  constructor(
    private configService: ConfigService<Config>,
    private engineService: EngineService,
    private logger: LoggerService
  ) {}

  // Provision the application if it's not already provisioned.
  // Update configuration if needed.
  // 1. Check if we have an App reference; App is initialized once.
  // 2. Check if we have Encryption set up; Encryption is initialized once.
  // 3. Auth can be updated, so change it if it's changed.

  // NOTE: The `adminApiKeyHash` argument is for test convenience in case it
  // needs to provision the application.
  async provision(adminApiKeyHash?: string): Promise<Engine> {
    return this.run({
      adminApiKeyHash,
      setupEncryption: async (app, thisApp, keyring) => {
        await this.setupEncryption(app, thisApp, keyring)
        await this.verifyRawEncryption(thisApp, keyring)
      }
    })
  }

  /**
   * Core provisioning logic that sets up or updates the application
   * configuration. This includes handling encryption setup and admin
   * authentication settings.
   *
   * @param params Configuration parameters for the provisioning process
   *
   * @param params.adminApiKeyHash Optional hash of the admin API key for
   * authentication
   *
   * @param params.setupEncryption Optional callback to customize encryption
   * setup. Receives current app state, new app config, and keyring
   * configuration. **Useful for disabling encryption during tests.**
   *
   * @returns Promise<App> The provisioned application configuration
   *
   * @throws ProvisionException If app is already provisioned with different ID
   *         or if encryption setup fails
   */
  protected async run(params: {
    adminApiKeyHash?: string
    setupEncryption?: (app: Engine | null, thisApp: Engine, keyring: Config['keyring']) => Promise<void>
  }): Promise<Engine> {
    const { adminApiKeyHash, setupEncryption } = params

    // TEMPORARY: Migrate the key-value format of the App config into the table format.
    // Can be removed once this runs once.
    await this.engineService.migrateV1Data()

    // Actually provision the new one; will not overwrite anything if this started from a migration
    const app = await this.engineService.getEngine()
    const keyring = this.configService.get('keyring')

    const thisApp: Engine = { ...(app || { id: this.getId(), encryptionKeyringType: keyring.type }) }
    if (app && app.id !== this.getId()) {
      throw new ProvisionException('App already provisioned with a different ID', {
        current: this.getId(),
        saved: app.id
      })
    }

    if (setupEncryption) {
      await setupEncryption(app, thisApp, keyring)
    }

    // Now set the Auth if needed
    thisApp.adminApiKeyHash = adminApiKeyHash || this.getAdminApiKeyHash() || null // fallback to null so we _unset_ it if it's not provided.

    // If we have an app already & the adminApiKeyHash has changed, just log that we're changing it.
    if (app && thisApp.adminApiKeyHash !== app?.adminApiKeyHash) {
      this.logger.log('Admin API Key has been changed', {
        previous: app?.adminApiKeyHash,
        current: thisApp.adminApiKeyHash
      })
    }

    // Check if we disabled all auth
    thisApp.authDisabled = this.configService.get('app.auth.disabled')
    if (thisApp.authDisabled) {
      thisApp.adminApiKeyHash = null
    }

    this.logger.log('App configuration saved')

    return this.engineService.save(thisApp)
  }

  protected async setupEncryption(app: Engine | null, thisApp: Engine, keyring: Config['keyring']) {
    // No encryption set up yet, so initialize encryption
    if (!app?.encryptionKeyringType || (!app.encryptionMasterKey && !app.encryptionMasterAwsKmsArn)) {
      thisApp.encryptionKeyringType = keyring.type

      if (keyring.type === 'awskms' && keyring.encryptionMasterAwsKmsArn) {
        this.logger.log('Using AWS KMS for encryption')
        thisApp.encryptionMasterAwsKmsArn = keyring.encryptionMasterAwsKmsArn
      } else if (keyring.type === 'raw') {
        // If we have the masterKey set in config, we'll save that.
        // Otherwise, we'll generate a new one.
        if (keyring.encryptionMasterKey) {
          this.logger.log('Using provided master key')
          thisApp.encryptionMasterKey = keyring.encryptionMasterKey
        } else {
          this.logger.log('Generating master encryption key')
          const { encryptionMasterPassword } = keyring
          const kek = generateKeyEncryptionKey(encryptionMasterPassword, thisApp.id)
          const masterKey = await generateMasterKey(kek) // Encrypted master encryption key
          thisApp.encryptionMasterKey = masterKey
        }
      } else {
        throw new ProvisionException('Unsupported keyring type')
      }
    }
  }

  protected async verifyRawEncryption(thisApp: Engine, keyring: Config['keyring']) {
    // if raw encryption, verify the encryptionMasterPassword in config is the valid kek for the encryptionMasterKey
    if (thisApp?.encryptionKeyringType === 'raw' && keyring.type === 'raw' && thisApp.encryptionMasterKey) {
      try {
        const kek = generateKeyEncryptionKey(keyring.encryptionMasterPassword, thisApp.id)
        await decryptMasterKey(kek, toBytes(thisApp.encryptionMasterKey))
        this.logger.log('Master Encryption Key Verified')
      } catch (error) {
        this.logger.error(
          'Master Encryption Key Verification Failed; check the encryptionMasterPassword is the one that encrypted the masterKey',
          { error }
        )
        throw new ProvisionException('Master Encryption Key Verification Failed', { error })
      }
    }
  }

  private getAdminApiKeyHash(): string | null | undefined {
    const localAuth = this.configService.get('app.auth.local')

    return localAuth?.adminApiKeyHash
  }
  private getId(): string {
    return this.configService.get('app.id')
  }
}
