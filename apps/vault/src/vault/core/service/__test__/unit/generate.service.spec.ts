import { FIXTURE, toBytes } from '@narval/policy-engine-shared'
import { publicKeyToHex } from '@narval/signature'
import { Test, TestingModule } from '@nestjs/testing'
import { HDKey } from '@scure/bip32'
import { ApplicationException } from '../../../../../shared/exception/application.exception'
import { Wallet } from '../../../../../shared/type/domain.type'
import { ImportRepository } from '../../../../persistence/repository/import.repository'
import { WalletRepository } from '../../../../persistence/repository/wallet.repository'
import { HdKeyToWallet, buildDerivePath, mnemonicToWallet } from '../../../utils/key-generation'
import { KeyGenerationService } from '../../generate.service'

describe('GenerateService', () => {
  let keyGenerationService: KeyGenerationService
  let walletRepository: WalletRepository

  const mnemonic = 'legal winner thank year wave sausage worth useful legal winner thank yellow'
  const firstDerivedWallet = {
    privateKey: '0x33fa40f84e854b941c2b0436dd4a256e1df1cb41b9c1c0ccc8446408c19b8bf9',
    publicKey:
      '0x04a70d1ef368ad99e90d509496e9888ee7404e4f4d360376bf521d769cf0c4de46902ab6f9d90af66773b6ead2fe3a0a1cb3225697d1617b1f2d37f493988d867d',
    address: '0x58a57ed9d8d624cbd12e2c467d34787555bb1b25',
    id: 'eip155:eoa:0x58a57ed9d8d624cbd12e2c467d34787555bb1b25',
    keyId: '0x769e8be15c534fa697e6ea7c5b671de4be454477d8ac64265a77f821f19101f1',
    derivationPath: "m/44'/60'/0'/0/0"
  }
  const PRIVATE_KEY = '0x7cfef3303797cbc7515d9ce22ffe849c701b0f2812f999b0847229c47951fca5'

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
        }
      ]
    }).compile()

    keyGenerationService = module.get<KeyGenerationService>(KeyGenerationService)
    walletRepository = module.get<WalletRepository>(WalletRepository)
  })

  it('generate a mnemonic', async () => {
    const wallet = await keyGenerationService.generateMnemonic('clientId', {})
    expect(wallet.privateKey).toBeDefined()
    expect(wallet.publicKey).toBeDefined()
    expect(wallet.address).toBeDefined()
    expect(wallet.id).toBeDefined()
    expect(wallet.keyId).toBeDefined()
  })
  it('derive a wallet from a mnemonic', async () => {
    const wallet = await mnemonicToWallet(mnemonic)
    expect(Wallet.parse(wallet)).toBe(true)
    expect(wallet).toEqual(firstDerivedWallet)
  })
  it('derive multiple wallets from same mnemonic using custom path', async () => {
    const mnemonic = 'legal winner thank year wave sausage worth useful legal winner thank yellow'
    const walletWithDefaultPath = await mnemonicToWallet(mnemonic)
    const walletWithCustomAccountIndex = await mnemonicToWallet(mnemonic, { addressIndex: 1 })

    expect(walletWithDefaultPath).toEqual(firstDerivedWallet)
    expect(Wallet.parse(walletWithCustomAccountIndex)).toBe(false)
    expect(walletWithCustomAccountIndex.derivationPath).toEqual("m/44'/60'/0'/0/1")
    expect(walletWithCustomAccountIndex.id).not.toEqual(walletWithDefaultPath.id)
    expect(walletWithCustomAccountIndex.address).not.toEqual(walletWithDefaultPath.address)
    expect(walletWithCustomAccountIndex.privateKey).not.toEqual(walletWithDefaultPath.privateKey)
    expect(walletWithCustomAccountIndex.publicKey).not.toEqual(walletWithDefaultPath.publicKey)
  })
  it('save the wallet to the database', async () => {
    const wallet = await keyGenerationService.generateMnemonic('clientId', {})
    expect(walletRepository.save).toHaveBeenCalledWith(wallet)
  })
  it('throw an error if the HDKey does not have a private key', async () => {
    const hdKey = new HDKey({
      publicKey: toBytes(await publicKeyToHex(FIXTURE.PUBLIC_KEYS_JWK.Root))
    })
    try {
      await HdKeyToWallet(hdKey, buildDerivePath({}))
    } catch (error) {
      expect(error).toBeInstanceOf(ApplicationException)
      expect(error.message).toEqual('HDKey does not have a private key')
    }
  })
})
