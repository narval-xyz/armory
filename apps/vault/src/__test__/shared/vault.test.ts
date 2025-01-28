import { EncryptionModuleOptionProvider } from '@narval/encryption-module'
import { LoggerModule } from '@narval/nestjs-shared'
import { ModuleMetadata } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Test, TestingModuleBuilder } from '@nestjs/testing'
import { mock } from 'jest-mock-extended'
import { ProvisionService } from '../../provision.service'
import { getTestRawAesKeyring } from '../../shared/testing/encryption.testing'
import { App } from '../../shared/type/domain.type'

class TestProvisionService extends ProvisionService {
  async provision(adminApiKeyHash?: string): Promise<App> {
    return this.run({
      adminApiKeyHash,
      setupEncryption: undefined
    })
  }
}

export class VaultTest {
  static createTestingModule(metadata: ModuleMetadata): TestingModuleBuilder {
    const module = Test.createTestingModule(metadata)
      .overrideModule(LoggerModule)
      .useModule(LoggerModule.forTest())
      .overrideProvider(EncryptionModuleOptionProvider)
      .useValue({
        keyring: getTestRawAesKeyring()
      })
      // The encryption setup in production takes approximately 550ms. The
      // provision is being called on the `beforeEach` hook which drastically
      // increases the test time. Since most test cases don't need encryption to
      // work correctly, we disable it to save 0.5 seconds per test case.
      .overrideProvider(ProvisionService)
      .useClass(TestProvisionService)
      // Mock the event emitter because we don't want to send a
      // connection.activated event after the creation.
      .overrideProvider(EventEmitter2)
      .useValue(mock<EventEmitter2>())

    return module
  }
}
