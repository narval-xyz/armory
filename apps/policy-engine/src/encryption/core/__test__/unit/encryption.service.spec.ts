import { toBytes, toHex } from '@narval/policy-engine-shared'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { mock } from 'jest-mock-extended'
import { load } from '../../../../policy-engine.config'
import { EncryptionRepository } from '../../../persistence/repository/encryption.repository'
import { EncryptionService } from '../../encryption.service'

describe('EncryptionService', () => {
  let service: EncryptionService

  beforeEach(async () => {
    // These mocked config values matter; they're specifically tied to the mocked masterKey below
    // If you change these, the decryption won't work & tests will fail
    const configServiceMock = mock<ConfigService>({
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'keyring') {
          return {
            type: 'raw',
            masterPassword: 'unsafe-local-dev-master-password'
          }
        }
        if (key === 'engine.id') {
          return 'local-dev-engine-instance-1'
        }
      })
    })

    const encryptionRepositoryMock = {
      getEngine: jest.fn().mockImplementation(() =>
        Promise.resolve({
          // unencryptedMasterKey: dfd9cc70f1ad02d19e0efa020d82f557022f59ca6bedbec1df38e8fd37ae3bb9
          masterKey:
            '0x0205785d67737fa3bae8eb249cf8d3baed5942f1677d8c98b4cdeef55560a3bcf510bd008d00030003617070000d61726d6f72792d656e67696e6500156177732d63727970746f2d7075626c69632d6b657900444177336764324b6e58646f512f2b76745347367031444442384d65766d61434b324c7861426e65476a315531537777526b376b4d366868752f707a446f48724c77773d3d0007707572706f7365000f646174612d656e6372797074696f6e000100146e617276616c2e61726d6f72792e656e67696e65002561726d6f72792e656e67696e652e6b656b000000800000000c8a92a7c9deb43316f6c29e8d0030132d63c7337c9888a06b638966e83056a0575958b42588b7aed999b9659e6d4bc5bed4664d91fae0b14d48917e00cdbb02000010000749ed0ed3616b7990f9e73f5a42eb46dc182002612e33dcb8e3c7d4759184c46ce3f0893a87ac15257d53097ac5d74affffffff00000001000000000000000000000001000000205d7209b51db8cf8264b9065add71a8514dc26baa6987d8a0a3acb1c4a2503b0f3b7c974a35ed234c1b94668736cd8bfa00673065023100a5d8d192e9802649dab86af6e00ab6d7472533e85dfe1006cb8bd9ef2472d15096fa42e742d18cb92530c762c3bd44d40230350299b42feaa1149c6ad1b25add24c30b3bf1c08263b96df0d43e2ad3e19802872e792040f1faf3d0a73bca6fb067ca',
          id: 'test-engine-id'
        })
      )
    }
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        })
      ],
      providers: [
        EncryptionService,
        {
          provide: EncryptionRepository,
          useValue: encryptionRepositoryMock
        },
        {
          provide: ConfigService,
          useValue: configServiceMock // use the mock ConfigService
        }
      ]
    }).compile()

    service = moduleRef.get<EncryptionService>(EncryptionService)
    if (service.onApplicationBootstrap) {
      await service.onApplicationBootstrap()
    }
  })

  it('should encrypt then decrypt successfully, with a string', async () => {
    const data = 'Hello World'
    const encrypted = await service.encrypt(data)
    const decrypted = await service.decrypt(encrypted)

    expect(decrypted.toString('utf-8')).toBe(data)
  })

  it('should encrypt then decrypt successfully, with a buffer from a hexstring', async () => {
    const data = '0xdfd9cc70f1ad02d19e0efa020d82f557022f59ca6bedbec1df38e8fd37ae3bb9'
    const encrypted = await service.encrypt(toBytes(data))
    const decrypted = await service.decrypt(encrypted)

    expect(toHex(decrypted)).toBe(data)
  })
})
