import { KmsKeyringNode, RawAesKeyringNode } from '@aws-crypto/client-node'
import {
  EncryptionModuleOption,
  decryptMasterKey,
  generateKeyEncryptionKey,
  isolateBuffer
} from '@narval/encryption-module'
import { toBytes } from '@narval/policy-engine-shared'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Config } from '../../main.config'
import { ENCRYPTION_KEY_NAME, ENCRYPTION_KEY_NAMESPACE, ENCRYPTION_WRAPPING_SUITE } from '../../main.constant'
import { AppService } from '../../vault/core/service/app.service'

@Injectable()
export class EncryptionModuleOptionFactory {
  private logger = new Logger(EncryptionModuleOptionFactory.name)

  constructor(
    private appService: AppService,
    private configService: ConfigService<Config, true>
  ) {}

  async create(): Promise<EncryptionModuleOption> {
    const keyringConfig = this.configService.get('keyring', { infer: true })
    const app = await this.appService.getApp()

    // NOTE: An undefined app at boot time only happens during the
    // provisioning.
    if (!app) {
      this.logger.warn('Booting the encryption module without a keyring. Please, provision the app.')

      return {
        keyring: undefined
      }
    }

    if (keyringConfig.type === 'raw') {
      if (!app.masterKey) {
        throw new Error('Master key not set')
      }

      const kek = generateKeyEncryptionKey(keyringConfig.masterPassword, app.id)
      const unencryptedMasterKey = await decryptMasterKey(kek, toBytes(app.masterKey))

      return {
        keyring: new RawAesKeyringNode({
          unencryptedMasterKey: isolateBuffer(unencryptedMasterKey),
          keyName: ENCRYPTION_KEY_NAME,
          keyNamespace: ENCRYPTION_KEY_NAMESPACE,
          wrappingSuite: ENCRYPTION_WRAPPING_SUITE
        })
      }
    } else if (keyringConfig.type === 'awskms') {
      // We have AWS KMS config so we'll use that instead as the MasterKey, which means we don't need a KEK separately
      const keyring = new KmsKeyringNode({ generatorKeyId: keyringConfig.masterAwsKmsArn })
      return { keyring }
    }

    throw new Error('Unsupported keyring type')
  }
}
