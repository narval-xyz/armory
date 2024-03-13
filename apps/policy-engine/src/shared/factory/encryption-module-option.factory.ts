import { RawAesKeyringNode } from '@aws-crypto/client-node'
import {
  EncryptionModuleOption,
  decryptMasterKey,
  generateKeyEncryptionKey,
  isolateBuffer
} from '@narval/encryption-module'
import { toBytes } from '@narval/policy-engine-shared'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EngineService } from '../../engine/core/service/engine.service'
import { Config } from '../../policy-engine.config'
import { ENCRYPTION_KEY_NAME, ENCRYPTION_KEY_NAMESPACE, ENCRYPTION_WRAPPING_SUITE } from '../../policy-engine.constant'

@Injectable()
export class EncryptionModuleOptionFactory {
  private logger = new Logger(EncryptionModuleOptionFactory.name)

  constructor(
    private engineService: EngineService,
    private configService: ConfigService<Config, true>
  ) {}

  async create(): Promise<EncryptionModuleOption> {
    const keyring = this.configService.get('keyring', { infer: true })
    const engine = await this.engineService.getEngine()

    // NOTE: An undefined engine at boot time only happens during the
    // provisioning.
    if (!engine) {
      this.logger.warn('Booting the encryption module without a keyring. Please, provision the engine.')

      return {
        keyring: undefined
      }
    }

    if (keyring.type === 'raw') {
      if (!engine.masterKey) {
        throw new Error('Master key not set')
      }

      const kek = generateKeyEncryptionKey(keyring.masterPassword, engine.id)
      const unencryptedMasterKey = await decryptMasterKey(kek, toBytes(engine.masterKey))

      return {
        keyring: new RawAesKeyringNode({
          unencryptedMasterKey: isolateBuffer(unencryptedMasterKey),
          keyName: ENCRYPTION_KEY_NAME,
          keyNamespace: ENCRYPTION_KEY_NAMESPACE,
          wrappingSuite: ENCRYPTION_WRAPPING_SUITE
        })
      }
    }

    throw new Error('Unsupported keyring type')
  }
}
