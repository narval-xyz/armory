import { Ed25519PrivateKey, getPublicKey } from '@narval/signature'
import { INestApplication } from '@nestjs/common'
import { TestingModule } from '@nestjs/testing'
import { v4 as uuid } from 'uuid'
import { generatePrivateKey, privateKeyToAddress } from 'viem/accounts'
import { VaultTest } from '../../../../../../__test__/shared/vault.test'
import { ClientService } from '../../../../../../client/core/service/client.service'
import { MainModule } from '../../../../../../main.module'
import { ProvisionService } from '../../../../../../provision.service'
import { TestPrismaService } from '../../../../../../shared/module/persistence/service/test-prisma.service'
import { testClient } from '../../../../../__test__/util/mock-data'
import { AccountRepository } from '../../../../../persistence/repository/account.repository'
import { AddressRepository } from '../../../../../persistence/repository/address.repository'
import { ConnectionRepository } from '../../../../../persistence/repository/connection.repository'
import { TransferRepository } from '../../../../../persistence/repository/transfer.repository'
import { WalletRepository } from '../../../../../persistence/repository/wallet.repository'
import { AssetSeed } from '../../../../../persistence/seed/asset.seed'
import { NetworkSeed } from '../../../../../persistence/seed/network.seed'
import { setupMockServer, useRequestSpy } from '../../../../../shared/__test__/mock-server'
import { ConnectionStatus, ConnectionWithCredentials } from '../../../../type/connection.type'
import { Account, Address, Wallet } from '../../../../type/indexed-resources.type'
import { Provider } from '../../../../type/provider.type'
import {
  InternalTransfer,
  NetworkFeeAttribution,
  TransferPartyType,
  TransferStatus
} from '../../../../type/transfer.type'
import { AnchorageTransferService } from '../../anchorage-transfer.service'
import { ANCHORAGE_TEST_API_BASE_URL, getHandlers } from '../server-mock/server'

describe(AnchorageTransferService.name, () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService

  let accountRepository: AccountRepository
  let addressRepository: AddressRepository
  let anchorageTransferService: AnchorageTransferService
  let assetSeed: AssetSeed
  let clientService: ClientService
  let connectionRepository: ConnectionRepository
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
    connectionId: connection.connectionId,
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
    connectionId: connection.connectionId,
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
    connectionId: connection.connectionId,
    addressId: uuid(),
    clientId,
    createdAt: new Date(),
    externalId: uuid(),
    provider: Provider.ANCHORAGE,
    updatedAt: new Date()
  }

  const wallet: Wallet = {
    clientId,
    connectionId: connection.connectionId,
    createdAt: new Date(),
    externalId: uuid(),
    label: null,
    provider: Provider.ANCHORAGE,
    updatedAt: new Date(),
    walletId
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
    externalStatus: null,
    assetId: 'BTC',
    assetExternalId: null,
    connectionId: connection.connectionId,
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
    module = await VaultTest.createTestingModule({
      imports: [MainModule]
    }).compile()

    app = module.createNestApplication()

    testPrismaService = module.get(TestPrismaService)
    anchorageTransferService = module.get(AnchorageTransferService)
    provisionService = module.get(ProvisionService)
    clientService = module.get<ClientService>(ClientService)

    accountRepository = module.get(AccountRepository)
    addressRepository = module.get(AddressRepository)
    assetSeed = module.get(AssetSeed)
    connectionRepository = module.get(ConnectionRepository)
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
    await assetSeed.seed()

    await connectionRepository.create(connection)
    await walletRepository.bulkCreate([wallet])
    await accountRepository.bulkCreate([accountOne, accountTwo])
    await addressRepository.bulkCreate([address])
    await transferRepository.bulkCreate([internalTransfer])

    await app.init()
  })

  describe('findById', () => {
    it('maps data from internal transfer', async () => {
      const transfer = await anchorageTransferService.findById(connection, internalTransfer.transferId)

      expect(transfer).toMatchObject({
        assetId: internalTransfer.assetId,
        clientId: internalTransfer.clientId,
        customerRefId: internalTransfer.customerRefId,
        connectionId: connection.connectionId,
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
      const { externalStatus, ...transfer } = await anchorageTransferService.send(connection, requiredSendTransfer)
      const actualInternalTransfer = await transferRepository.findById(clientId, transfer.transferId)

      expect(actualInternalTransfer).toMatchObject(transfer)
      expect(externalStatus).toEqual(expect.any(String))
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

    it('calls Anchorage with address', async () => {
      const [spy] = useRequestSpy(mockServer)
      const address = privateKeyToAddress(generatePrivateKey())
      const sendTransfer = {
        ...requiredSendTransfer,
        destination: { address },
        transferId: 'test-transfer-id'
      }

      await anchorageTransferService.send(connection, sendTransfer)

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            source: {
              type: 'WALLET',
              id: accountOne.externalId
            },
            destination: {
              type: 'ADDRESS',
              id: address
            }
          })
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
  })
})
