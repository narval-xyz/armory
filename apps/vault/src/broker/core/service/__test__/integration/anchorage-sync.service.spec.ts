import { ConfigModule } from '@narval/config-module'
import { HttpModule, LoggerModule } from '@narval/nestjs-shared'
import { Alg, generateJwk, privateKeyToHex } from '@narval/signature'
import { Test } from '@nestjs/testing'
import { v4 as uuid } from 'uuid'
import { load } from '../../../../../main.config'
import { PersistenceModule } from '../../../../../shared/module/persistence/persistence.module'
import { TestPrismaService } from '../../../../../shared/module/persistence/service/test-prisma.service'
import { TransitEncryptionModule } from '../../../../../transit-encryption/transit-encryption.module'
import { AnchorageClient } from '../../../../http/client/anchorage.client'
import { AccountRepository } from '../../../../persistence/repository/account.repository'
import { AddressRepository } from '../../../../persistence/repository/address.repository'
import { ConnectionRepository } from '../../../../persistence/repository/connection.repository'
import { WalletRepository } from '../../../../persistence/repository/wallet.repository'
import { ActiveConnection, Provider } from '../../../type/connection.type'
import { Account } from '../../../type/indexed-resources.type'
import { AccountService } from '../../account.service'
import { AddressService } from '../../address.service'
import { AnchorageSyncService } from '../../anchorage-sync.service'
import { ConnectionService } from '../../connection.service'
import { WalletService } from '../../wallet.service'
import { ANCHORAGE_TEST_API_BASE_URL, setupMockServer } from './mocks/anchorage/server'

describe(AnchorageSyncService.name, () => {
  let testPrismaService: TestPrismaService
  let anchorageSyncService: AnchorageSyncService
  let connectionService: ConnectionService
  let connection: ActiveConnection
  let walletService: WalletRepository
  let accountService: AccountService
  let addressService: AddressService

  setupMockServer()

  const clientId = uuid()

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        PersistenceModule,
        TransitEncryptionModule,
        HttpModule.register(),
        LoggerModule.forTest(),
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        })
      ],
      providers: [
        AnchorageSyncService,
        AnchorageClient,
        ConnectionService,
        ConnectionRepository,
        WalletService,
        WalletRepository,
        AccountService,
        AccountRepository,
        AddressService,
        AddressRepository
      ]
    }).compile()

    testPrismaService = module.get(TestPrismaService)
    anchorageSyncService = module.get(AnchorageSyncService)
    connectionService = module.get(ConnectionService)
    walletService = module.get(WalletService)
    accountService = module.get(AccountService)
    addressService = module.get(AddressService)

    await testPrismaService.truncateAll()

    connection = await connectionService.create(clientId, {
      connectionId: uuid(),
      provider: Provider.ANCHORAGE,
      url: ANCHORAGE_TEST_API_BASE_URL,
      credentials: {
        apiKey: 'test-api-key',
        privateKey: await privateKeyToHex(await generateJwk(Alg.EDDSA))
      }
    })
  })

  describe('syncWallets', () => {
    it('fetches anchorage vaults and persist them as wallets', async () => {
      const syncedWallets = await anchorageSyncService.syncWallets(connection)

      const wallets = await walletService.findAll(connection.clientId)

      expect(syncedWallets).toEqual(wallets)
    })

    it('does not duplicate wallets', async () => {
      const [first, second] = await Promise.all([
        await anchorageSyncService.syncWallets(connection),
        await anchorageSyncService.syncWallets(connection)
      ])

      expect(first.length).toEqual(2)
      expect(second.length).toEqual(0)
    })
  })

  describe('syncAccounts', () => {
    const sortByExternalId = (a: Account, b: Account) => a.externalId.localeCompare(b.externalId)

    it('fetches anchorage wallets and persist them as accounts', async () => {
      await anchorageSyncService.syncWallets(connection)

      const syncedAccounts = await anchorageSyncService.syncAccounts(connection)

      const accounts = await accountService.findAll(connection.clientId)

      expect(syncedAccounts.sort(sortByExternalId)).toEqual(accounts.sort(sortByExternalId))
    })

    it('does not duplicate accounts', async () => {
      await anchorageSyncService.syncWallets(connection)

      const [first, second] = await Promise.all([
        await anchorageSyncService.syncAccounts(connection),
        await anchorageSyncService.syncAccounts(connection)
      ])

      expect(first.length).toEqual(18)
      expect(second.length).toEqual(0)
    })
  })

  describe('syncAddresses', () => {
    beforeEach(async () => {
      await anchorageSyncService.syncWallets(connection)
      await anchorageSyncService.syncAccounts(connection)
    })

    it('fetches anchorage addresses and persist them as addresses', async () => {
      const syncedAddresses = await anchorageSyncService.syncAddresses(connection)

      const addresses = await addressService.findAll(connection.clientId)

      expect(syncedAddresses).toEqual(
        addresses.map((address) => ({
          ...address,
          addressId: expect.any(String)
        }))
      )
    })

    it('does not duplicate addresses', async () => {
      const [first, second] = await Promise.all([
        await anchorageSyncService.syncAddresses(connection),
        await anchorageSyncService.syncAddresses(connection)
      ])

      expect(first.length).toEqual(1)
      expect(second.length).toEqual(0)
    })
  })
})
