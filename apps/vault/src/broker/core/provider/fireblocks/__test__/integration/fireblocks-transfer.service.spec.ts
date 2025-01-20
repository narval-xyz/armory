import { EncryptionModuleOptionProvider } from '@narval/encryption-module'
import { LoggerModule } from '@narval/nestjs-shared'
import { RsaPrivateKey, getPublicKey } from '@narval/signature'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { randomUUID } from 'crypto'
import { generatePrivateKey, privateKeyToAddress } from 'viem/accounts'
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
import { TransferRepository } from '../../../../../persistence/repository/transfer.repository'
import { WalletRepository } from '../../../../../persistence/repository/wallet.repository'
import { AssetSeed } from '../../../../../persistence/seed/asset.seed'
import { NetworkSeed } from '../../../../../persistence/seed/network.seed'
import { setupMockServer, useRequestSpy } from '../../../../../shared/__test__/mock-server'
import { Connection, ConnectionStatus, ConnectionWithCredentials } from '../../../../type/connection.type'
import { Account, Address, Wallet } from '../../../../type/indexed-resources.type'
import { Provider } from '../../../../type/provider.type'
import {
  InternalTransfer,
  NetworkFeeAttribution,
  TransferPartyType,
  TransferStatus
} from '../../../../type/transfer.type'
import { FireblocksTransferService } from '../../fireblocks-transfer.service'
import { FIREBLOCKS_TEST_API_BASE_URL, getHandlers } from '../server-mock/server'

describe(FireblocksTransferService.name, () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService

  let accountRepository: AccountRepository
  let addressRepository: AddressRepository
  let assetSeed: AssetSeed
  let clientService: ClientService
  let connectionRepository: ConnectionRepository
  let fireblocksTransferService: FireblocksTransferService
  let networkSeed: NetworkSeed
  let provisionService: ProvisionService
  let transferRepository: TransferRepository
  let walletRepository: WalletRepository

  const mockServer = setupMockServer(getHandlers())

  const clientId = randomUUID()

  const walletOneId = randomUUID()

  const walletTwoId = randomUUID()

  const rsaPrivate: RsaPrivateKey = {
    kty: 'RSA',
    alg: 'RS256',
    kid: '0x52920ad0d19d7779106bd9d9d600d26c4b976cdb3cbc49decb7fdc29db00b8e9',
    n: 'xNdTjWL9hGa4bz4tLKbmFZ4yjQsQzW35-CMS0kno3403jEqg5y2Cs6sLVyPBX4N2hdK5ERPytpf1PrThHqB-eEO6LtEWpENBgFuNIf8DRHrv0tne7dLNxf7sx1aocGRrkgIk4Ws6Is4Ot3whm3-WihmDGnHoogE-EPwVkkSc2FYPXYlNq4htCZXC8_MUI3LuXry2Gn4tna5HsYSehYhfKDD-nfSajeWxdNUv_3wOeSCr9ICm9Udlo7hpIUHQgnX3Nz6kvfGYuweLGoj_ot-oEUCIdlbQqmrfStAclugbM5NI6tY__6wD0z_4ZBjToupXCBlXbYsde6_ZG9xPmYSykw',
    e: 'AQAB',
    d: 'QU4rIzpXX8jwob-gHzNUHJH6tX6ZWX6GM0P3p5rrztc8Oag8z9XyigdSYNu0-SpVdTqfOcJDgT7TF7XNBms66k2WBJhMCb1iiuJU5ZWEkQC0dmDgLEkHCgx0pAHlKjy2z580ezEm_YsdqNRfFgbze-fQ7kIiazU8UUhBI-DtpHv7baBgsfqEfQ5nCTiURUPmmpiIU74-ZIJWZjBXTOoJNH0EIsJK9IpZzxpeC9mTMTsWTcHKiR3acze1qf-9I97v461TTZ8e33N6YINyr9I4HZuvxlCJdV_lOM3fLvYM9gPvgkPozhVWL3VKR6xa9JpGGHrCRgH92INuviBB_SmF8Q',
    p: '9BNku_-t4Df9Dg7M2yjiNgZgcTNKrDnNqexliIUAt67q0tGmSBubjxeI5unDJZ_giXWUR3q-02v7HT5GYx-ZVgKk2lWnbrrm_F7UZW-ueHzeVvQcjDXTk0z8taXzrDJgnIwZIaZ2XSG3P-VPOrXCaMba8GzSq38Gpzi4g3lTO9s',
    q: 'znUtwrqdnVew14_aFjNTRgzOQNN8JhkjzJy3aTSLBScK5NbiuUUZBWs5dQ7Nv7aAoDss1-o9XVQZ1DVV-o9UufJtyrPNcvTnC0cWRrtJrSN5YiuUbECU3Uj3OvGxnhx9tsmhDHnMTo50ObPYUbHcIkNaXkf2FVgL84y1JRWdPak',
    dp: 'UNDrFeS-6fMf8zurURXkcQcDf_f_za8GDjGcHOwNJMTiNBP-_vlFNMgSKINWfmrFqj4obtKRxOeIKlKoc8HOv8_4TeL2oY95VC8CHOQx3Otbo2cI3NQlziw7sNnWKTo1CyDIYYAAyS2Uw69l4Ia2bIMLk3g0-VwCE_SQA9h0Wuk',
    dq: 'VBe6ieSFKn97UnIPfJdvRcsVf6YknUgEIuV6d2mlbnXWpBs6wgf5BxIDl0BuYbYuchVoUJHiaM9Grf8DhEk5U3wBaF0QQ9CpAxjzY-AJRHJ8kJX7oJQ1jmSX_vRPSn2EXx2FcZVyuFSh1pcAd1YgufwBJQHepBb21z7q0a4aG_E',
    qi: 'KhZpFs6xfyRIjbJV8Q9gWxqF37ONayIzBpgio5mdAQlZ-FUmaWZ2_2VWP2xvsP48BmwFXydHqewHBqGnZYCQ1ZHXJgD_-KKEejoqS5AJN1pdI0ZKjs7UCfZ4RJ4DH5p0_35gpuKRzzdvcIhl1CjIC5W8o7nhwmLBJ_QAo9e4t9U'
  }

  const testApiKey = 'test-api-key'

  const connection: ConnectionWithCredentials = {
    clientId,
    connectionId: randomUUID(),
    createdAt: new Date(),
    provider: Provider.FIREBLOCKS,
    status: ConnectionStatus.ACTIVE,
    updatedAt: new Date(),
    url: FIREBLOCKS_TEST_API_BASE_URL,
    credentials: {
      privateKey: rsaPrivate,
      publicKey: getPublicKey(rsaPrivate),
      apiKey: testApiKey
    }
  }

  const accountOne: Account = {
    accountId: randomUUID(),
    addresses: [],
    clientId,
    createdAt: new Date(),
    externalId: randomUUID(),
    label: 'Account 1',
    networkId: 'POLYGON',
    provider: Provider.FIREBLOCKS,
    updatedAt: new Date(),
    walletId: walletOneId
  }

  const accountTwo: Account = {
    accountId: randomUUID(),
    addresses: [],
    clientId,
    createdAt: new Date(),
    externalId: randomUUID(),
    label: 'Account 2',
    networkId: 'POLYGON',
    provider: Provider.FIREBLOCKS,
    updatedAt: new Date(),
    walletId: walletTwoId
  }

  const walletOne: Wallet = {
    clientId,
    connections: [Connection.parse(connection)],
    createdAt: new Date(),
    externalId: randomUUID(),
    label: null,
    provider: Provider.FIREBLOCKS,
    updatedAt: new Date(),
    walletId: walletOneId
  }

  const walletTwo: Wallet = {
    clientId,
    connections: [Connection.parse(connection)],
    createdAt: new Date(),
    externalId: randomUUID(),
    label: null,
    provider: Provider.FIREBLOCKS,
    updatedAt: new Date(),
    walletId: walletTwoId
  }

  const address: Address = {
    accountId: accountTwo.accountId,
    address: '0x2c4895215973cbbd778c32c456c074b99daf8bf1',
    addressId: randomUUID(),
    clientId,
    createdAt: new Date(),
    externalId: randomUUID(),
    provider: Provider.FIREBLOCKS,
    updatedAt: new Date()
  }

  const internalTransfer: InternalTransfer = {
    clientId,
    source: {
      type: TransferPartyType.ACCOUNT,
      id: accountOne.accountId
    },
    destination: {
      type: TransferPartyType.ACCOUNT,
      id: accountTwo.accountId
    },
    customerRefId: null,
    idempotenceId: null,
    externalId: randomUUID(),
    externalStatus: null,
    assetId: 'MATIC',
    memo: 'Test transfer',
    grossAmount: '0.00001',
    networkFeeAttribution: NetworkFeeAttribution.DEDUCT,
    provider: Provider.FIREBLOCKS,
    transferId: randomUUID(),
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

    accountRepository = module.get(AccountRepository)
    addressRepository = module.get(AddressRepository)
    assetSeed = module.get(AssetSeed)
    clientService = module.get(ClientService)
    connectionRepository = module.get(ConnectionRepository)
    fireblocksTransferService = module.get(FireblocksTransferService)
    networkSeed = module.get(NetworkSeed)
    provisionService = module.get(ProvisionService)
    testPrismaService = module.get(TestPrismaService)
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
    await walletRepository.bulkCreate([walletOne, walletTwo])
    await accountRepository.bulkCreate([accountOne, accountTwo])
    await addressRepository.bulkCreate([address])
    await transferRepository.bulkCreate([internalTransfer])

    await app.init()
  })

  describe('findById', () => {
    it('maps data from internal transfer', async () => {
      const transfer = await fireblocksTransferService.findById(connection, internalTransfer.transferId)

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

    it('maps gross amount from inbound transaction', async () => {
      const transfer = await fireblocksTransferService.findById(connection, internalTransfer.transferId)

      expect(transfer.grossAmount).toEqual('0.001')
    })

    it('maps status from inbound transaction', async () => {
      const transfer = await fireblocksTransferService.findById(connection, internalTransfer.transferId)

      expect(transfer.status).toEqual(TransferStatus.SUCCESS)
    })

    it('maps memo from internal transfer when inbound note is undefined', async () => {
      const transfer = await fireblocksTransferService.findById(connection, internalTransfer.transferId)

      expect(transfer.memo).toEqual(internalTransfer.memo)
    })

    it('maps network fee from inbound transaction ', async () => {
      const transfer = await fireblocksTransferService.findById(connection, internalTransfer.transferId)

      expect(transfer.fees.find(({ type }) => type === 'network')).toEqual({
        amount: '0.002354982918981',
        assetId: 'MATIC_POLYGON',
        attribution: internalTransfer.networkFeeAttribution,
        type: 'network'
      })
    })

    it('maps gas price as a fee from inbound transaction', async () => {
      const transfer = await fireblocksTransferService.findById(connection, internalTransfer.transferId)

      expect(transfer.fees.find(({ type }) => type === 'gas-price')).toEqual({
        amount: '112.14204376100001',
        assetId: 'MATIC_POLYGON',
        type: 'gas-price'
      })
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
      amount: '0.001',
      asset: {
        externalAssetId: 'MATIC_POLYGON'
      },
      idempotenceId: randomUUID()
    }

    it('creates an internal transfer on success', async () => {
      const { externalStatus, ...transfer } = await fireblocksTransferService.send(connection, requiredSendTransfer)
      const actualInternalTransfer = await transferRepository.findById(clientId, transfer.transferId)

      expect(actualInternalTransfer).toMatchObject(transfer)
      expect(externalStatus).toEqual(expect.any(String))
    })

    it('creates with optional properties', async () => {
      const sendTransfer = {
        ...requiredSendTransfer,
        memo: 'Integration test transfer',
        customerRefId: 'test-customer-ref-id',
        networkFeeAttribution: NetworkFeeAttribution.DEDUCT,
        idempotenceId: randomUUID()
      }

      const internalTransfer = await fireblocksTransferService.send(connection, sendTransfer)
      const actualInternalTransfer = await transferRepository.findById(clientId, internalTransfer.transferId)

      expect(actualInternalTransfer.idempotenceId).toEqual(sendTransfer.idempotenceId)
      expect(actualInternalTransfer.memo).toEqual(sendTransfer.memo)
      expect(actualInternalTransfer.customerRefId).toEqual(sendTransfer.customerRefId)
      expect(actualInternalTransfer.networkFeeAttribution).toEqual(sendTransfer.networkFeeAttribution)
    })

    it('defaults network fee attribution to deduct', async () => {
      const internalTransfer = await fireblocksTransferService.send(connection, requiredSendTransfer)

      expect(internalTransfer.networkFeeAttribution).toEqual(NetworkFeeAttribution.DEDUCT)
    })

    it('calls Fireblocks', async () => {
      const [spy] = useRequestSpy(mockServer)
      const sendTransfer = {
        ...requiredSendTransfer,
        memo: 'Integration test transfer',
        transferId: 'test-transfer-id'
      }

      await fireblocksTransferService.send(connection, sendTransfer)

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          body: {
            amount: '0.001',
            assetId: 'MATIC_POLYGON',
            source: {
              type: 'VAULT_ACCOUNT',
              id: walletOne.externalId
            },
            destination: {
              type: 'VAULT_ACCOUNT',
              id: walletTwo.externalId
            },
            note: 'Integration test transfer',
            externalTxId: sendTransfer.transferId,
            treatAsGrossAmount: true
          },
          headers: expect.objectContaining({
            'x-api-key': testApiKey,
            'idempotency-key': requiredSendTransfer.idempotenceId
          })
        })
      )
    })

    it('calls Fireblocks with vault account as destination for internal address', async () => {
      const [spy] = useRequestSpy(mockServer)
      const sendTransfer = {
        ...requiredSendTransfer,
        destination: { address: address.address },
        transferId: 'test-transfer-id'
      }

      await fireblocksTransferService.send(connection, sendTransfer)

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            source: {
              type: 'VAULT_ACCOUNT',
              id: walletOne.externalId
            },
            destination: {
              type: 'VAULT_ACCOUNT',
              id: walletTwo.externalId
            }
          })
        })
      )
    })

    it('calls Fireblocks with one-time address', async () => {
      const [spy] = useRequestSpy(mockServer)
      const address = privateKeyToAddress(generatePrivateKey())
      const sendTransfer = {
        ...requiredSendTransfer,
        destination: { address },
        transferId: 'test-transfer-id'
      }

      await fireblocksTransferService.send(connection, sendTransfer)

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            source: {
              type: 'VAULT_ACCOUNT',
              id: walletOne.externalId
            },
            destination: {
              type: 'ONE_TIME_ADDRESS',
              oneTimeAddress: { address }
            }
          })
        })
      )
    })

    it('handles provider specific', async () => {
      const [spy] = useRequestSpy(mockServer)
      const providerSpecific = {
        extraParameters: {
          nodeControls: {
            type: 'NODE_ROUTER'
          },
          rawMessageData: {
            messages: [
              {
                preHash: {
                  hashAlgorithm: 'SHA256'
                }
              }
            ]
          }
        }
      }
      const sendTransfer = {
        ...requiredSendTransfer,
        providerSpecific
      }

      const internalTransfer = await fireblocksTransferService.send(connection, sendTransfer)
      const actualInternalTransfer = await transferRepository.findById(clientId, internalTransfer.transferId)

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({ ...sendTransfer.providerSpecific })
        })
      )

      expect(actualInternalTransfer.providerSpecific).toEqual(sendTransfer.providerSpecific)
    })

    it('maps networkFeeAttribution on_top to treatAsGrossAmount false', async () => {
      const [spy] = useRequestSpy(mockServer)

      await fireblocksTransferService.send(connection, {
        ...requiredSendTransfer,
        networkFeeAttribution: NetworkFeeAttribution.ON_TOP
      })

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            treatAsGrossAmount: false
          })
        })
      )
    })
  })
})
