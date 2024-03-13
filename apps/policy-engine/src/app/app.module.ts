import { RawAesKeyringNode } from '@aws-crypto/client-node'
import { EncryptionModule, decryptMasterKey, generateKeyEncryptionKey, isolateBuffer } from '@narval/encryption-module'
import { toBytes } from '@narval/policy-engine-shared'
import { HttpModule } from '@nestjs/axios'
import { Module, OnApplicationBootstrap, ValidationPipe } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_PIPE } from '@nestjs/core'
import { Config, load } from '../policy-engine.config'
import { ENCRYPTION_KEY_NAME, ENCRYPTION_KEY_NAMESPACE, ENCRYPTION_WRAPPING_SUITE } from '../policy-engine.constant'
import { KeyValueModule } from '../shared/module/key-value/key-value.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DataStoreRepositoryFactory } from './core/factory/data-store-repository.factory'
import { BootstrapService } from './core/service/bootstrap.service'
import { DataStoreService } from './core/service/data-store.service'
import { EngineService } from './core/service/engine.service'
import { ProvisionService } from './core/service/provision.service'
import { SigningService } from './core/service/signing.service'
import { TenantService } from './core/service/tenant.service'
import { TenantController } from './http/rest/controller/tenant.controller'
import { OpaService } from './opa/opa.service'
import { EngineRepository } from './persistence/repository/engine.repository'
import { EntityRepository } from './persistence/repository/entity.repository'
import { FileSystemDataStoreRepository } from './persistence/repository/file-system-data-store.repository'
import { HttpDataStoreRepository } from './persistence/repository/http-data-store.repository'
import { TenantRepository } from './persistence/repository/tenant.repository'

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [load],
      isGlobal: true
    }),
    HttpModule,
    KeyValueModule,
    EncryptionModule.registerAsync({
      imports: [AppModule],
      inject: [EngineService, ConfigService],
      useFactory: async (engineService: EngineService, configService: ConfigService<Config, true>) => {
        const keyring = configService.get('keyring', { infer: true })
        const engine = await engineService.getEngine()

        // NOTE: An undefined engine at boot time only happens during the
        // provisioning.
        if (!engine) {
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
    })
  ],
  controllers: [AppController, TenantController],
  providers: [
    AppService,
    BootstrapService,
    DataStoreRepositoryFactory,
    DataStoreService,
    EngineRepository,
    EngineService,
    EntityRepository,
    FileSystemDataStoreRepository,
    HttpDataStoreRepository,
    OpaService,
    ProvisionService,
    SigningService,
    TenantRepository,
    TenantService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe
    }
  ],
  // - The EngineService is required by the EncryptionModule async registration.
  // - The ProvisionService is required by the CliModule.
  exports: [EngineService, ProvisionService]
})
export class AppModule implements OnApplicationBootstrap {
  constructor(private bootstrapService: BootstrapService) {}

  async onApplicationBootstrap() {
    await this.bootstrapService.boot()
  }
}
