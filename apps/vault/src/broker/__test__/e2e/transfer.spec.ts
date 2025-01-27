import { EncryptionModuleOptionProvider } from '@narval/encryption-module'
import { LoggerModule, REQUEST_HEADER_CLIENT_ID } from '@narval/nestjs-shared'
import { Ed25519PrivateKey, getPublicKey } from '@narval/signature'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Test, TestingModule } from '@nestjs/testing'
import { mock } from 'jest-mock-extended'
import { HttpResponse, http } from 'msw'
import request from 'supertest'
import { v4 as uuid } from 'uuid'
import { ClientService } from '../../../client/core/service/client.service'
import { MainModule } from '../../../main.module'
import { ProvisionService } from '../../../provision.service'
import { KeyValueRepository } from '../../../shared/module/key-value/core/repository/key-value.repository'
import { InMemoryKeyValueRepository } from '../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { getTestRawAesKeyring } from '../../../shared/testing/encryption.testing'
import postAnchorageTransferBadRequest from '../../core/provider/anchorage/__test__/server-mock/response/post-transfer-400.json'
import { ANCHORAGE_TEST_API_BASE_URL, getHandlers } from '../../core/provider/anchorage/__test__/server-mock/server'
import { ConnectionStatus, ConnectionWithCredentials } from '../../core/type/connection.type'
import { Account, Wallet } from '../../core/type/indexed-resources.type'
import { Provider } from '../../core/type/provider.type'
import {
  InternalTransfer,
  NetworkFeeAttribution,
  SendTransfer,
  TransferPartyType,
  TransferStatus
} from '../../core/type/transfer.type'
import { AccountRepository } from '../../persistence/repository/account.repository'
import { ConnectionRepository } from '../../persistence/repository/connection.repository'
import { TransferRepository } from '../../persistence/repository/transfer.repository'
import { WalletRepository } from '../../persistence/repository/wallet.repository'
import { AssetSeed } from '../../persistence/seed/asset.seed'
import { NetworkSeed } from '../../persistence/seed/network.seed'
import { setupMockServer } from '../../shared/__test__/mock-server'
import { REQUEST_HEADER_CONNECTION_ID } from '../../shared/constant'
import { getJwsd, testClient, testUserPrivateJwk } from '../util/mock-data'

const ENDPOINT = '/provider/transfers'

describe('Transfer', () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService
  let provisionService: ProvisionService
  let clientService: ClientService

  let accountRepository: AccountRepository
  let connectionRepository: ConnectionRepository
  let networkSeed: NetworkSeed
  let assetSeed: AssetSeed
  let transferRepository: TransferRepository
  let walletRepository: WalletRepository

  const clientId = testClient.clientId

  const externalId = '008d3ec72558ce907571886df63ef51594b5bd8cf106a0b7fa8f12a30dfc867f'

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
    networkId: 'BTC',
    connectionId: connection.connectionId,
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
    networkId: 'BTC',
    connectionId: connection.connectionId,
    provider: Provider.ANCHORAGE,
    updatedAt: new Date(),
    walletId
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
    assetExternalId: null,
    assetId: 'BTC',
    createdAt: new Date(),
    customerRefId: null,
    destination: {
      type: TransferPartyType.ACCOUNT,
      id: accountTwo.accountId
    },
    externalId: uuid(),
    externalStatus: null,
    grossAmount: '0.00001',
    idempotenceId: uuid(),
    connectionId: connection.connectionId,
    memo: 'Test transfer',
    networkFeeAttribution: NetworkFeeAttribution.DEDUCT,
    provider: Provider.ANCHORAGE,
    source: {
      type: TransferPartyType.ACCOUNT,
      id: accountOne.accountId
    },
    status: TransferStatus.SUCCESS,
    transferId: uuid()
  }

  const mockServer = setupMockServer(getHandlers())

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
      // Mock the event emitter because we don't want to send a
      // connection.activated event after the creation.
      .overrideProvider(EventEmitter2)
      .useValue(mock<EventEmitter2>())
      .compile()

    app = module.createNestApplication()

    accountRepository = module.get(AccountRepository)
    assetSeed = module.get(AssetSeed)
    clientService = module.get(ClientService)
    connectionRepository = module.get(ConnectionRepository)
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

    await connectionRepository.create(connection)
    await walletRepository.bulkCreate([wallet])
    await accountRepository.bulkCreate([accountOne, accountTwo])
    await transferRepository.bulkCreate([internalTransfer])

    await networkSeed.seed()
    await assetSeed.seed()

    await app.init()
  })

  describe(`POST ${ENDPOINT}`, () => {
    let requiredPayload: SendTransfer

    beforeEach(() => {
      requiredPayload = {
        source: {
          type: TransferPartyType.ACCOUNT,
          id: accountOne.accountId
        },
        destination: {
          type: TransferPartyType.ACCOUNT,
          id: accountTwo.accountId
        },
        amount: '0.0001',
        asset: {
          assetId: 'BTC'
        },
        idempotenceId: uuid()
      }
    })

    it('sends transfer to anchorage', async () => {
      const { status, body } = await request(app.getHttpServer())
        .post(ENDPOINT)
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(REQUEST_HEADER_CONNECTION_ID, connection.connectionId)
        .set(
          'detached-jws',
          await getJwsd({
            payload: requiredPayload,
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: ENDPOINT,
            htm: 'POST'
          })
        )
        .send(requiredPayload)

      expect(body).toEqual({
        data: {
          clientId,
          externalId,
          assetId: requiredPayload.asset.assetId,
          assetExternalId: requiredPayload.asset.assetId,
          createdAt: expect.any(String),
          customerRefId: null,
          destination: requiredPayload.destination,
          externalStatus: expect.any(String),
          grossAmount: requiredPayload.amount,
          connectionId: connection.connectionId,
          idempotenceId: expect.any(String),
          memo: null,
          networkFeeAttribution: NetworkFeeAttribution.ON_TOP,
          provider: accountOne.provider,
          providerSpecific: null,
          source: requiredPayload.source,
          status: TransferStatus.PROCESSING,
          transferId: expect.any(String)
        }
      })

      expect(status).toEqual(HttpStatus.CREATED)
    })

    it('sends transfer with optional properties', async () => {
      const payload = {
        ...requiredPayload,
        memo: 'Test transfer',
        networkFeeAttribution: NetworkFeeAttribution.DEDUCT,
        customerRefId: uuid(),
        idempotenceId: uuid()
      }

      const { body } = await request(app.getHttpServer())
        .post(ENDPOINT)
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(REQUEST_HEADER_CONNECTION_ID, connection.connectionId)
        .set(
          'detached-jws',
          await getJwsd({
            payload,
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: ENDPOINT,
            htm: 'POST'
          })
        )
        .send(payload)

      const actualTransfer = await transferRepository.findById(clientId, body.data.transferId)

      expect(actualTransfer.memo).toEqual(payload.memo)
      expect(body.data.memo).toEqual(payload.memo)

      expect(actualTransfer.networkFeeAttribution).toEqual(payload.networkFeeAttribution)
      expect(body.data.networkFeeAttribution).toEqual(payload.networkFeeAttribution)

      // Invalid fields should not be sent to the provider
      expect(actualTransfer.customerRefId).toEqual(null)
      expect(body.data.customerRefId).toEqual(null)

      expect(actualTransfer.idempotenceId).toEqual(payload.idempotenceId)
      expect(body.data.idempotenceId).toEqual(payload.idempotenceId)
    })

    it('propagates provider http errors', async () => {
      mockServer.use(
        http.post(`${ANCHORAGE_TEST_API_BASE_URL}/v2/transfers`, () => {
          return new HttpResponse(JSON.stringify(postAnchorageTransferBadRequest), {
            status: HttpStatus.BAD_REQUEST
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as unknown as any)
        })
      )

      const { status, body } = await request(app.getHttpServer())
        .post(ENDPOINT)
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(REQUEST_HEADER_CONNECTION_ID, connection.connectionId)
        .set(
          'detached-jws',
          await getJwsd({
            payload: requiredPayload,
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: ENDPOINT,
            htm: 'POST'
          })
        )
        .send(requiredPayload)

      expect(body).toMatchObject({
        statusCode: 400,
        message: 'Provider ANCHORAGE responded with 400 error',
        context: {
          provider: 'anchorage',
          error: {
            errorType: 'InternalError',
            message: "Missing required field 'amount'."
          }
        }
      })

      expect(status).toEqual(HttpStatus.BAD_REQUEST)
    })

    it('fails if connection header is missing', async () => {
      const { body } = await request(app.getHttpServer())
        .post(ENDPOINT)
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(
          'detached-jws',
          await getJwsd({
            payload: requiredPayload,
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: ENDPOINT,
            htm: 'POST'
          })
        )
        .send(requiredPayload)

      expect(body).toMatchObject({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Missing or invalid x-connection-id header'
      })
    })

    it('responds with conflict when idempotence id was already used', async () => {
      await request(app.getHttpServer())
        .post(ENDPOINT)
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(REQUEST_HEADER_CONNECTION_ID, connection.connectionId)
        .set(
          'detached-jws',
          await getJwsd({
            payload: requiredPayload,
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: ENDPOINT,
            htm: 'POST'
          })
        )
        .send(requiredPayload)

      const { status } = await request(app.getHttpServer())
        .post(ENDPOINT)
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(REQUEST_HEADER_CONNECTION_ID, connection.connectionId)
        .set(
          'detached-jws',
          await getJwsd({
            payload: requiredPayload,
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: ENDPOINT,
            htm: 'POST'
          })
        )
        .send(requiredPayload)

      expect(status).toEqual(HttpStatus.CONFLICT)
    })
  })

  describe(`GET ${ENDPOINT}/:transferId`, () => {
    const internalTransfer = {
      assetExternalId: null,
      assetId: 'BTC',
      clientId: connection.clientId,
      createdAt: new Date(),
      customerRefId: uuid(),
      destination: {
        type: TransferPartyType.ACCOUNT,
        id: accountTwo.accountId
      },
      externalId: uuid(),
      externalStatus: null,
      grossAmount: '0.00001',
      idempotenceId: uuid(),
      memo: 'Test transfer',
      networkFeeAttribution: NetworkFeeAttribution.DEDUCT,
      provider: Provider.ANCHORAGE,
      connectionId: connection.connectionId,
      providerSpecific: null,
      source: {
        type: TransferPartyType.ACCOUNT,
        id: accountOne.accountId
      },
      status: TransferStatus.PROCESSING,
      transferId: uuid()
    }

    beforeEach(async () => {
      await transferRepository.bulkCreate([internalTransfer])
    })

    it('responds with the specific transfer', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get(`${ENDPOINT}/${internalTransfer.transferId}`)
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(REQUEST_HEADER_CONNECTION_ID, connection.connectionId)
        .set(
          'detached-jws',
          await getJwsd({
            payload: {},
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: `${ENDPOINT}/${internalTransfer.transferId}`,
            htm: 'GET'
          })
        )
        .send()

      expect(body).toEqual({
        data: {
          ...internalTransfer,
          // NOTE: The status is different from `transfer` because it's coming
          // from the Anchorage API. The `findById` merges the state we have in
          // the database with the API's.
          status: TransferStatus.SUCCESS,
          externalStatus: expect.any(String),
          createdAt: expect.any(String)
        }
      })

      expect(status).toEqual(HttpStatus.OK)
    })

    it('fails if connection header is missing', async () => {
      const { body } = await request(app.getHttpServer())
        .get(`${ENDPOINT}/${internalTransfer.transferId}`)
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(
          'detached-jws',
          await getJwsd({
            payload: {},
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: `${ENDPOINT}/${internalTransfer.transferId}`,
            htm: 'GET'
          })
        )
        .send()

      expect(body).toMatchObject({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Missing or invalid x-connection-id header'
      })
    })
  })
})
