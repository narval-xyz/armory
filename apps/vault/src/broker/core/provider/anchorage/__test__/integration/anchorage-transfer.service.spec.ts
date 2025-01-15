import { EncryptionModuleOptionProvider } from '@narval/encryption-module'
import { LoggerModule } from '@narval/nestjs-shared'
import { Ed25519PrivateKey, getPublicKey } from '@narval/signature'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { v4 as uuid } from 'uuid'
import { ClientService } from '../../../../../../client/core/service/client.service'
import { MainModule } from '../../../../../../main.module'
import { ProvisionService } from '../../../../../../provision.service'
import { KeyValueRepository } from '../../../../../../shared/module/key-value/core/repository/key-value.repository'
import { InMemoryKeyValueRepository } from '../../../../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { TestPrismaService } from '../../../../../../shared/module/persistence/service/test-prisma.service'
import { getTestRawAesKeyring } from '../../../../../../shared/testing/encryption.testing'
import { testClient } from '../../../../../__test__/util/mock-data'
import { AccountRepository } from '../../../../../persistence/repository/account.repository'
import { AddressRepository } from '../../../../../persistence/repository/address.repository'
import { ConnectionRepository } from '../../../../../persistence/repository/connection.repository'
import { KnownDestinationRepository } from '../../../../../persistence/repository/known-destination.repository'
import { TransferRepository } from '../../../../../persistence/repository/transfer.repository'
import { WalletRepository } from '../../../../../persistence/repository/wallet.repository'
import { NetworkSeed } from '../../../../../persistence/seed/network.seed'
import { setupMockServer, useRequestSpy } from '../../../../../shared/__test__/mock-server'
import { Connection, ConnectionStatus, ConnectionWithCredentials } from '../../../../type/connection.type'
import { Account, Address, KnownDestination, Wallet } from '../../../../type/indexed-resources.type'
import { Provider } from '../../../../type/provider.type'
import {
  InternalTransfer,
  NetworkFeeAttribution,
  TransferPartyType,
  TransferStatus
} from '../../../../type/transfer.type'
import { AnchorageAssetService } from '../../anchorage-asset.service'
import { AnchorageTransferService } from '../../anchorage-transfer.service'
import { ANCHORAGE_TEST_API_BASE_URL, getHandlers } from '../server-mock/server'

describe(AnchorageTransferService.name, () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService

  let accountRepository: AccountRepository
  let addressRepository: AddressRepository
  let anchorageAssetService: AnchorageAssetService
  let anchorageTransferService: AnchorageTransferService
  let clientService: ClientService
  let connectionRepository: ConnectionRepository
  let knownDestinationRepository: KnownDestinationRepository
  let networkSeed: NetworkSeed
  let provisionService: ProvisionService
  let transferRepository: TransferRepository
  let walletRepository: WalletRepository

  const mockServer = setupMockServer(getHandlers())

  const clientId = uuid()

  const externalId = '60a0676772fdbd7a041e9451c61c3cb6b28ee901186e40ac99433308604e2e20'

  const walletId = uuid()

  const eddsaPrivateKey: Ed25519PrivateKey = {
    kty: 'OKP',
    crv: 'Ed25519',
    alg: 'EDDSA',
    kid: '0xa6fe705025aa4c48abbb3a1ed679d7dc7d18e7994b4d5cb1884479fddeb2e706',
    x: 'U4WSOMzD7gor6jiVz42jT22JGBcfGfzMomt8PFC_-_U',
    d: 'evo-fY2BX60V1n3Z690LadH5BvizcM9bESaYk0LsxyQ'
  }

  const connection: ConnectionWithCredentials = {
    clientId,
    connectionId: uuid(),
    createdAt: new Date(),
    provider: Provider.ANCHORAGE,
    status: ConnectionStatus.ACTIVE,
    updatedAt: new Date(),
    url: ANCHORAGE_TEST_API_BASE_URL,
    credentials: {
      privateKey: eddsaPrivateKey,
      publicKey: getPublicKey(eddsaPrivateKey),
      apiKey: 'test-api-key'
    }
  }

  const accountOne: Account = {
    accountId: uuid(),
    addresses: [],
    clientId,
    createdAt: new Date(),
    externalId: uuid(),
    label: 'Account 1',
    networkId: 'BITCOIN',
    provider: Provider.ANCHORAGE,
    updatedAt: new Date(),
    walletId
  }

  const accountTwo: Account = {
    accountId: uuid(),
    addresses: [],
    clientId,
    createdAt: new Date(),
    externalId: uuid(),
    label: 'Account 2',
    networkId: 'BITCOIN',
    provider: Provider.ANCHORAGE,
    updatedAt: new Date(),
    walletId
  }

  const address: Address = {
    accountId: accountTwo.accountId,
    address: '0x2c4895215973cbbd778c32c456c074b99daf8bf1',
    addressId: uuid(),
    clientId,
    createdAt: new Date(),
    externalId: uuid(),
    provider: Provider.ANCHORAGE,
    updatedAt: new Date()
  }

  const wallet: Wallet = {
    clientId,
    connections: [Connection.parse(connection)],
    createdAt: new Date(),
    externalId: uuid(),
    label: null,
    provider: Provider.ANCHORAGE,
    updatedAt: new Date(),
    walletId
  }

  const knownDestination: KnownDestination = {
    address: '0x04b12f0863b83c7162429f0ebb0dfda20e1aa97b',
    clientId,
    connections: [],
    createdAt: new Date(),
    externalId: uuid(),
    knownDestinationId: uuid(),
    networkId: 'BITCOIN',
    provider: Provider.ANCHORAGE,
    updatedAt: new Date()
  }

  const internalTransfer: InternalTransfer = {
    clientId,
    customerRefId: null,
    idempotenceId: null,
    destination: {
      type: TransferPartyType.ACCOUNT,
      id: accountTwo.accountId
    },
    externalId,
    assetId: 'BTC',
    memo: 'Test transfer',
    grossAmount: '0.00001',
    networkFeeAttribution: NetworkFeeAttribution.DEDUCT,
    provider: Provider.ANCHORAGE,
    source: {
      type: TransferPartyType.ACCOUNT,
      id: accountOne.accountId
    },
    transferId: uuid(),
    createdAt: new Date()
  }

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [MainModule]
    })
      .overrideModule(LoggerModule)
      .useModule(LoggerModule.forTest())
      .overrideProvider(KeyValueRepository)
      .useValue(new InMemoryKeyValueRepository())
      .overrideProvider(EncryptionModuleOptionProvider)
      .useValue({
        keyring: getTestRawAesKeyring()
      })
      .compile()

    app = module.createNestApplication()

    testPrismaService = module.get(TestPrismaService)
    anchorageTransferService = module.get(AnchorageTransferService)
    provisionService = module.get(ProvisionService)
    clientService = module.get<ClientService>(ClientService)

    accountRepository = module.get(AccountRepository)
    addressRepository = module.get(AddressRepository)
    anchorageAssetService = module.get(AnchorageAssetService)
    connectionRepository = module.get(ConnectionRepository)
    knownDestinationRepository = module.get(KnownDestinationRepository)
    networkSeed = module.get(NetworkSeed)
    transferRepository = module.get(TransferRepository)
    walletRepository = module.get(WalletRepository)

    await testPrismaService.truncateAll()
  })

  afterAll(async () => {
    await testPrismaService.truncateAll()
    await module.close()
    await app.close()
  })

  beforeEach(async () => {
    await testPrismaService.truncateAll()

    await provisionService.provision()
    await clientService.save(testClient)
    await networkSeed.seed()

    await connectionRepository.create(connection)
    await walletRepository.bulkCreate([wallet])
    await accountRepository.bulkCreate([accountOne, accountTwo])
    await addressRepository.bulkCreate([address])
    await transferRepository.bulkCreate([internalTransfer])
    await knownDestinationRepository.bulkCreate([knownDestination])

    await app.init()
  })

  describe('findById', () => {
    it('maps data from internal transfer', async () => {
      const transfer = await anchorageTransferService.findById(connection, internalTransfer.transferId)

      expect(transfer).toMatchObject({
        assetId: internalTransfer.assetId,
        clientId: internalTransfer.clientId,
        customerRefId: internalTransfer.customerRefId,
        destination: internalTransfer.destination,
        externalId: internalTransfer.externalId,
        idempotenceId: internalTransfer.idempotenceId,
        networkFeeAttribution: internalTransfer.networkFeeAttribution,
        provider: internalTransfer.provider,
        source: internalTransfer.source,
        transferId: internalTransfer.transferId
      })
    })

    it('maps gross amount from inbound transfer', async () => {
      const transfer = await anchorageTransferService.findById(connection, internalTransfer.transferId)

      expect(transfer.grossAmount).toEqual('0.00001')
    })

    it('maps status from inbound transfer', async () => {
      const transfer = await anchorageTransferService.findById(connection, internalTransfer.transferId)

      expect(transfer.status).toEqual(TransferStatus.SUCCESS)
    })

    it('maps memo from internal transfer when inbound transferMemo is undefined', async () => {
      const transfer = await anchorageTransferService.findById(connection, internalTransfer.transferId)

      expect(transfer.memo).toEqual(internalTransfer.memo)
    })

    it('maps network fee from inbound anchorage transfer', async () => {
      const transfer = await anchorageTransferService.findById(connection, internalTransfer.transferId)

      expect(transfer.fees).toEqual([
        {
          amount: '0.00001771',
          assetId: 'BTC_S',
          attribution: internalTransfer.networkFeeAttribution,
          type: 'network'
        }
      ])
    })
  })

  describe('send', () => {
    const requiredSendTransfer = {
      source: {
        type: TransferPartyType.ACCOUNT,
        id: accountOne.accountId
      },
      destination: {
        type: TransferPartyType.ACCOUNT,
        id: accountTwo.accountId
      },
      amount: '0.00005',
      asset: {
        assetId: 'BTC'
      },
      idempotenceId: uuid()
    }

    const transferAmlQuestionnaire = {
      destinationType: 'SELFHOSTED_WALLET',
      recipientType: 'PERSON',
      purpose: 'INVESTMENT',
      originatorType: 'MY_ORGANIZATION',
      selfhostedDescription: 'a wallet description',
      recipientFirstName: 'John',
      recipientLastName: 'Recipient',
      recipientFullName: 'John Recipient Full Name',
      recipientCountry: 'US',
      recipientStreetAddress: 'Some Recipient Street',
      recipientCity: 'New York',
      recipientStateProvince: 'NY',
      recipientPostalCode: '10101'
    }

    it('creates an internal transfer on success', async () => {
      const internalTransfer = await anchorageTransferService.send(connection, requiredSendTransfer)
      const actualInternalTransfer = await transferRepository.findById(clientId, internalTransfer.transferId)

      expect(actualInternalTransfer).toEqual(internalTransfer)
    })

    it('creates with optional properties', async () => {
      const sendTransfer = {
        ...requiredSendTransfer,
        memo: 'Integration test transfer',
        networkFeeAttribution: NetworkFeeAttribution.DEDUCT,
        idempotenceId: uuid()
      }

      const internalTransfer = await anchorageTransferService.send(connection, sendTransfer)
      const actualInternalTransfer = await transferRepository.findById(clientId, internalTransfer.transferId)

      expect(actualInternalTransfer.idempotenceId).toEqual(sendTransfer.idempotenceId)
      expect(actualInternalTransfer.memo).toEqual(sendTransfer.memo)
      // Anchorage does not support customerRefId.
      expect(actualInternalTransfer.customerRefId).toEqual(null)
      expect(actualInternalTransfer.networkFeeAttribution).toEqual(sendTransfer.networkFeeAttribution)
    })

    it('defaults network fee attribution to on_top', async () => {
      const internalTransfer = await anchorageTransferService.send(connection, requiredSendTransfer)

      expect(internalTransfer.networkFeeAttribution).toEqual(NetworkFeeAttribution.ON_TOP)
    })

    it('calls Anchorage', async () => {
      const [spy] = useRequestSpy(mockServer)
      const sendTransfer = {
        ...requiredSendTransfer,
        memo: 'Integration test transfer'
      }

      await anchorageTransferService.send(connection, sendTransfer)

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          body: {
            source: {
              type: 'WALLET',
              id: accountOne.externalId
            },
            destination: {
              type: 'WALLET',
              id: accountTwo.externalId
            },
            assetType: sendTransfer.asset.assetId,
            amount: sendTransfer.amount,
            transferMemo: sendTransfer.memo,
            idempotentId: sendTransfer.idempotenceId,
            // Default `deductFeeFromAmountIfSameType` to false.
            deductFeeFromAmountIfSameType: false
          }
        })
      )
    })

    // IMPORTANT: We never send the customerRefId to Anchorage because they
    // have deprecated it and it seems to get transfers stuck on their side.
    it('does not send customerRefId', async () => {
      const [spy] = useRequestSpy(mockServer)
      const sendTransfer = {
        ...requiredSendTransfer,
        customerRefId: uuid()
      }

      await anchorageTransferService.send(connection, sendTransfer)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect('customerRefId' in (spy.mock.calls[0][0] as any)).toEqual(false)
    })

    it('handles provider specific', async () => {
      const [spy] = useRequestSpy(mockServer)
      const sendTransfer = {
        ...requiredSendTransfer,
        provider: Provider.ANCHORAGE,
        providerSpecific: { transferAmlQuestionnaire }
      }

      const internalTransfer = await anchorageTransferService.send(connection, sendTransfer)
      const actualInternalTransfer = await transferRepository.findById(clientId, internalTransfer.transferId)

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({ ...sendTransfer.providerSpecific })
        })
      )

      expect(actualInternalTransfer.providerSpecific).toEqual(sendTransfer.providerSpecific)
    })

    it('maps networkFeeAttribution on_top to deductFeeFromAmountIfSameType false', async () => {
      const [spy] = useRequestSpy(mockServer)

      await anchorageTransferService.send(connection, {
        ...requiredSendTransfer,
        networkFeeAttribution: NetworkFeeAttribution.ON_TOP
      })

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            deductFeeFromAmountIfSameType: false
          })
        })
      )
    })

    it('maps networkFeeAttribution deduct to deductFeeFromAmountIfSameType true', async () => {
      const [spy] = useRequestSpy(mockServer)

      await anchorageTransferService.send(connection, {
        ...requiredSendTransfer,
        networkFeeAttribution: NetworkFeeAttribution.DEDUCT
      })

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            deductFeeFromAmountIfSameType: true
          })
        })
      )
    })

    it('sends to an internal address', async () => {
      const sendTransfer = {
        ...requiredSendTransfer,
        destination: {
          address: address.address
        }
      }

      const internalTransfer = await anchorageTransferService.send(connection, sendTransfer)
      const actualInternalTransfer = await transferRepository.findById(clientId, internalTransfer.transferId)

      expect(actualInternalTransfer).toMatchObject(internalTransfer)
    })

    it('sends to a known destination', async () => {
      const sendTransfer = {
        ...requiredSendTransfer,
        destination: {
          address: knownDestination.address
        }
      }

      const internalTransfer = await anchorageTransferService.send(connection, sendTransfer)
      const actualInternalTransfer = await transferRepository.findById(clientId, internalTransfer.transferId)

      expect(actualInternalTransfer).toMatchObject(internalTransfer)
    })
  })
})
