import { FIXTURE, toBytes } from '@narval/policy-engine-shared'
import { RsaPrivateKey, generateJwk, publicKeyToHex, rsaDecrypt } from '@narval/signature'
import { Test, TestingModule } from '@nestjs/testing'
import { HDKey } from '@scure/bip32'
import { ClientService } from '../../../../../client/core/service/client.service'
import { ApplicationException } from '../../../../../shared/exception/application.exception'
import { PrismaService } from '../../../../../shared/module/persistence/service/prisma.service'
import { Wallet } from '../../../../../shared/type/domain.type'
import { MnemonicRepository } from '../../../../../vault/persistence/repository/mnemonic.repository'
import { ImportRepository } from '../../../../persistence/repository/import.repository'
import { WalletRepository } from '../../../../persistence/repository/wallet.repository'
import { buildDerivePath, deriveWallet, hdKeyToWallet, mnemonicToRootKey } from '../../../utils/key-generation'
import { KeyGenerationService } from '../../generate.service'

const PRIVATE_KEY = '0x7cfef3303797cbc7515d9ce22ffe849c701b0f2812f999b0847229c47951fca5'

describe('GenerateService', () => {
  let keyGenerationService: KeyGenerationService
  let mnemonicRepository: MnemonicRepository

  const mnemonic = 'legal winner thank year wave sausage worth useful legal winner thank yellow'
  const rootKey = mnemonicToRootKey(mnemonic)
  const firstDerivedWallet = {
    privateKey: '0x33fa40f84e854b941c2b0436dd4a256e1df1cb41b9c1c0ccc8446408c19b8bf9',
    publicKey:
      '0x04a70d1ef368ad99e90d509496e9888ee7404e4f4d360376bf521d769cf0c4de46902ab6f9d90af66773b6ead2fe3a0a1cb3225697d1617b1f2d37f493988d867d',
    address: '0x58a57ed9d8d624cbd12e2c467d34787555bb1b25',
    id: 'eip155:eoa:0x58a57ed9d8d624cbd12e2c467d34787555bb1b25',
    keyId: '0x1ad67053dbaa34a78b8f1ce6151677881c79971394d570f7c8fca24bdff7d4f5',
    derivationPath: "m/44'/60'/0'/0/0"
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KeyGenerationService,
        {
          provide: WalletRepository,
          useValue: {
            // mock the methods of WalletRepository that are used in keyGenerationService
            // for example:
            save: jest.fn().mockResolvedValue({
              id: 'walletId',
              address: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
              privateKey: PRIVATE_KEY
            })
          }
        },
        {
          provide: ImportRepository,
          useValue: {}
        },
        {
          provide: ClientService,
          useValue: {
            findById: jest.fn().mockResolvedValue({})
          }
        },
        {
          provide: MnemonicRepository,
          useValue: {
            save: jest.fn().mockResolvedValue({
              mnemonic,
              keyId: 'keyId'
            })
          }
        },
        {
          provide: PrismaService,
          useValue: {}
        }
      ]
    }).compile()

    keyGenerationService = module.get<KeyGenerationService>(KeyGenerationService)
    mnemonicRepository = module.get<MnemonicRepository>(MnemonicRepository)
  })
  it('generate a mnemonic', async () => {
    const { wallet } = await keyGenerationService.generateMnemonic('clientId', {})
    expect(wallet.privateKey).toBeDefined()
    expect(wallet.publicKey).toBeDefined()
    expect(wallet.address).toBeDefined()
    expect(wallet.id).toBeDefined()
    expect(wallet.keyId).toBeDefined()
  })
  it('returns an encrypted backup if client has an RSA backupKey configured', async () => {
    const rsaBackupKey = await generateJwk<RsaPrivateKey>('RS256')
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KeyGenerationService,
        {
          provide: WalletRepository,
          useValue: {
            // mock the methods of WalletRepository that are used in keyGenerationService
            // for example:
            save: jest.fn().mockResolvedValue({
              id: 'walletId',
              address: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
              privateKey: PRIVATE_KEY
            })
          }
        },
        {
          provide: ImportRepository,
          useValue: {}
        },
        {
          provide: ClientService,
          useValue: {
            findById: jest.fn().mockResolvedValue({
              backupPublicKey: rsaBackupKey
            })
          }
        },
        {
          provide: MnemonicRepository,
          useValue: {
            save: jest.fn().mockResolvedValue({
              mnemonic,
              keyId: 'keyId'
            })
          }
        },
        {
          provide: PrismaService,
          useValue: {
            backup: {
              create: jest.fn().mockResolvedValue({})
            }
          }
        }
      ]
    }).compile()

    keyGenerationService = module.get<KeyGenerationService>(KeyGenerationService)
    mnemonicRepository = module.get<MnemonicRepository>(MnemonicRepository)

    const { backup } = await keyGenerationService.generateMnemonic('clientId', {})
    const decryptedMnemonic = await rsaDecrypt(backup as string, rsaBackupKey)
    const spaceInMnemonic = decryptedMnemonic.split(' ')
    expect(spaceInMnemonic.length).toBe(12)
  })
  it('derive a wallet from a rootKey', async () => {
    const wallet = await deriveWallet(rootKey)
    expect(Wallet.safeParse(wallet).success).toBe(true)
    expect(wallet).toEqual(firstDerivedWallet)
  })
  it('derive multiple wallets from same rootKey using custom path', async () => {
    const walletWithDefaultPath = await deriveWallet(rootKey)
    const walletWithCustomAccountIndex = await deriveWallet(rootKey, { addressIndex: 1 })

    expect(walletWithDefaultPath).toEqual(firstDerivedWallet)
    expect(Wallet.safeParse(walletWithCustomAccountIndex).success).toBe(true)
    expect(walletWithCustomAccountIndex.derivationPath).toEqual("m/44'/60'/0'/0/1")
    expect(walletWithCustomAccountIndex.id).not.toEqual(walletWithDefaultPath.id)
    expect(walletWithCustomAccountIndex.address).not.toEqual(walletWithDefaultPath.address)
    expect(walletWithCustomAccountIndex.privateKey).not.toEqual(walletWithDefaultPath.privateKey)
    expect(walletWithCustomAccountIndex.publicKey).not.toEqual(walletWithDefaultPath.publicKey)
  })
  it('save mnemonic to the database', async () => {
    await keyGenerationService.generateMnemonic('clientId', {})
    expect(mnemonicRepository.save).toHaveBeenCalledWith('clientId', {
      mnemonic: expect.any(String),
      keyId: expect.any(String)
    })
  })
  it('throw an error if the HDKey does not have a private key', async () => {
    const hdKey = new HDKey({
      publicKey: toBytes(await publicKeyToHex(FIXTURE.PUBLIC_KEYS_JWK.Root))
    })
    try {
      await hdKeyToWallet(hdKey, buildDerivePath({}), 'kid')
    } catch (error) {
      expect(error).toBeInstanceOf(ApplicationException)
      expect(error.message).toEqual('HDKey does not have a private key')
    }
  })
})
